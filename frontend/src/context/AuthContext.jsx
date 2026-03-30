import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as apiLogin, register as apiRegister } from '../services/auth'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  useEffect(() => {
    console.log('AuthProvider - useEffect ejecutándose')
    
    // Intentar recuperar usuario y token guardados
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user_data')
    
    console.log('Token guardado:', savedToken ? 'Sí' : 'No')
    console.log('Usuario guardado:', savedUser ? savedUser.substring(0, 100) : 'No')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log('Usuario recuperado:', userData)
        setUser(userData)
        setToken(savedToken)
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
      }
    } else {
      console.log('No hay datos de usuario guardados')
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    console.log('Intentando login con:', username)
    try {
      const response = await apiLogin(username, password)
      console.log('Respuesta del servidor:', response.data)
      
      const { access, refresh, user: userData } = response.data
      
      console.log('Datos del usuario recibidos:', userData)
      
      // Guardar en localStorage
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Actualizar estado
      setUser(userData)
      setToken(access)
      
      console.log('Estado actualizado - user:', userData)
      console.log('Estado actualizado - token:', access.substring(0, 50) + '...')
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      return { 
        success: false, 
        error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Error al iniciar sesión' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Register error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al registrar usuario' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!token && !!user
  }

  console.log('AuthProvider - Estado final:', { 
    user: user?.username, 
    role: user?.role,
    hasToken: !!token, 
    loading, 
    isAuthenticated: value.isAuthenticated 
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}