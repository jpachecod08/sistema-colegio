// services/api.js
import axios from 'axios'

// Vite usa import.meta.env en lugar de process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor para manejar tokens expirados
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Verificar si estamos en una página pública
    const isPublicPage = window.location.pathname === '/login' || 
                         window.location.pathname === '/register' ||
                         window.location.pathname === '/'
    
    // Si es error 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si estamos en página pública, no intentar refrescar ni redirigir
      if (isPublicPage) {
        console.log('API Interceptor - Error 401 en página pública, ignorando')
        return Promise.reject(error)
      }
      
      originalRequest._retry = true
      
      if (isRefreshing) {
        // Si ya se está refrescando, añadir a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }
      
      isRefreshing = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          console.log('API Interceptor - Intentando refrescar token...')
          const response = await axios.post(`${API_URL}/users/login/refresh/`, {
            refresh: refreshToken
          })
          
          if (response.data.access) {
            console.log('API Interceptor - Token refrescado exitosamente')
            const newToken = response.data.access
            localStorage.setItem('access_token', newToken)
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            
            processQueue(null, newToken)
            return api(originalRequest)
          }
        }
        throw new Error('No refresh token available')
      } catch (refreshError) {
        console.error('API Interceptor - Refresh token error:', refreshError)
        processQueue(refreshError, null)
        
        // Limpiar tokens solo si no estamos en página pública
        if (!isPublicPage) {
          console.log('API Interceptor - Limpiando tokens y redirigiendo a login')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_data')
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

export default api