import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const location = useLocation()
  const [settings, setSettings] = useState({
    school_name: 'Sistema Académico',
    school_address: '',
    school_phone: '',
    school_email: '',
    allow_registration: true,
    allow_grade_editing: true,
    grading_scale: '100',
    min_grade: 60
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si estamos en una página pública que no requiere autenticación
    const isPublicPage = location.pathname === '/login' || 
                         location.pathname === '/register' ||
                         location.pathname === '/'
    
    // También verificar si hay usuario autenticado (puedes acceder al token)
    const token = localStorage.getItem('access_token')
    const hasAuth = !!token
    
    console.log('SettingsProvider - Ruta actual:', location.pathname)
    console.log('SettingsProvider - Es página pública:', isPublicPage)
    console.log('SettingsProvider - Tiene token:', hasAuth)
    
    // Solo cargar settings si NO es página pública Y hay token
    if (!isPublicPage && hasAuth) {
      fetchSettings()
    } else {
      console.log('SettingsProvider - No cargar settings (página pública o sin token)')
      setLoading(false)
    }
  }, [location.pathname])

  const fetchSettings = async () => {
    try {
      console.log('SettingsProvider - Intentando cargar settings...')
      const response = await api.get('/settings/')
      console.log('SettingsProvider - Settings cargados:', response.data)
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      console.error('SettingsProvider - Error fetching settings:', error)
      // No hacer nada en caso de error, solo usar valores por defecto
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const response = await api.post('/settings/', newSettings)
      setSettings(response.data)
      return { success: true }
    } catch (error) {
      console.error('Error updating settings:', error)
      return { success: false, error: error.response?.data?.detail || 'Error al guardar' }
    }
  }

  const getMaxScore = () => {
    switch (settings.grading_scale) {
      case '10': return 10
      case '5': return 5
      default: return 100
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, getMaxScore }}>
      {children}
    </SettingsContext.Provider>
  )
}