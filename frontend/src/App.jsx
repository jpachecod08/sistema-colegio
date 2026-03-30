import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import TeacherDashboard from './components/Dashboard/TeacherDashboard'
import StudentDashboard from './components/Dashboard/StudentDashboard'
import ParentDashboard from './components/Dashboard/ParentDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import ProtectedRoute from './components/Common/ProtectedRoute'
import LoadingSpinner from './components/Common/LoadingSpinner'
import Grades from './components/Academics/Grades'
import Attendance from './components/Academics/Attendance'
import ReportCard from './components/Academics/ReportCard'

function App() {
  const { loading, user } = useAuth()

  console.log('=== APP RENDER ===')
  console.log('Loading:', loading)
  console.log('User:', user)
  console.log('User role:', user?.role)

  if (loading) {
    return <LoadingSpinner />
  }

  // Si no hay usuario, mostrar solo rutas públicas
  if (!user) {
    console.log('Usuario no autenticado, mostrando login')
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Usuario autenticado - mostrar todas las rutas protegidas
  console.log(`✅ Usuario autenticado como ${user.role}`)
  
  return (
    <Routes>
      {/* Redirigir login/register a home según el rol */}
      <Route path="/login" element={<Navigate to={`/${user.role}`} replace />} />
      <Route path="/register" element={<Navigate to={`/${user.role}`} replace />} />
      
      {/* Rutas específicas por rol con layout Home */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Home />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        {/* Rutas de admin - TODAS deben apuntar a AdminDashboard que maneja las subrutas internas */}
        <Route path="users/*" element={<AdminDashboard />} />
        <Route path="classes/*" element={<AdminDashboard />} />
        <Route path="subjects/*" element={<AdminDashboard />} />
        <Route path="assignments/*" element={<AdminDashboard />} />
        <Route path="enrollments/*" element={<AdminDashboard />} />  {/* ← Agrega esta línea para matrículas */}
        <Route path="reports/*" element={<AdminDashboard />} />
        <Route path="statistics/*" element={<AdminDashboard />} />
        <Route path="settings/*" element={<AdminDashboard />} />
        {/* Rutas académicas comunes */}
        <Route path="grades" element={<Grades />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="report-card" element={<ReportCard />} />
      </Route>
      
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <Home />
        </ProtectedRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="grades" element={<Grades />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="report-card" element={<ReportCard />} />
      </Route>
      
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Home />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="grades" element={<Grades />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="report-card" element={<ReportCard />} />
      </Route>
      
      <Route path="/parent" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <Home />
        </ProtectedRoute>
      }>
        <Route index element={<ParentDashboard />} />
        <Route path="grades" element={<Grades />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="report-card" element={<ReportCard />} />
      </Route>
      
      {/* Catch all - redirigir según el rol */}
      <Route path="*" element={<Navigate to={`/${user.role}`} replace />} />
    </Routes>
  )
}

export default App