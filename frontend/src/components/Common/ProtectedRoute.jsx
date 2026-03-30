import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth()

  console.log('=== PROTECTED ROUTE ===')
  console.log('Loading:', loading)
  console.log('IsAuthenticated:', isAuthenticated)
  console.log('User:', user)
  console.log('AllowedRoles:', allowedRoles)

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    console.log('No autenticado, redirigiendo a login')
    return <Navigate to="/login" replace />
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga uno
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log(`Acceso denegado: usuario con rol ${user?.role} no tiene permiso para esta ruta`)
    // Redirigir al dashboard según su rol
    const roleRoutes = {
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent',
    }
    return <Navigate to={roleRoutes[user?.role] || '/'} replace />
  }

  console.log('Acceso permitido')
  return children
}

export default ProtectedRoute