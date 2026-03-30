import api from './api'

export const login = (username, password) => {
  return api.post('/users/login/', { username, password })
}

export const register = (userData) => {
  return api.post('/users/register/', userData)
}

export const getCurrentUser = () => {
  return api.get('/users/profile/')
}

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}