// components/admin/AdminStatistics.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import { ArrowBack, BarChart, PieChart, TrendingUp, People, School, Grade } from '@mui/icons-material'
import api from '../../services/api'

const AdminStatistics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    users: { total: 0, teachers: 0, students: 0, parents: 0, admins: 0 },
    academics: { classes: 0, subjects: 0, periods: 4 },
    grades: { total: 0, average: 0, passing: 0, failing: 0, passingRate: 0 },
    attendance: { total: 0, present: 0, absent: 0, late: 0, rate: 0 }
  })

  const extractDataFromResponse = (response) => {
    if (!response || !response.data) return []
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      
      // Obtener usuarios
      let users = []
      try {
        const r = await api.get('/users/list/')
        users = extractDataFromResponse(r)
      } catch(e) { console.error('Error fetching users:', e) }
      
      // Obtener clases
      let classes = []
      try {
        const r = await api.get('/academics/grades/')
        classes = extractDataFromResponse(r)
      } catch(e) { console.error('Error fetching classes:', e) }
      
      // Obtener materias
      let subjects = []
      try {
        const r = await api.get('/academics/subjects/')
        subjects = extractDataFromResponse(r)
      } catch(e) { console.error('Error fetching subjects:', e) }
      
      // Obtener estadísticas de calificaciones
      let gradesStats = { passing: 0, failing: 0, average: 0 }
      try {
        const r = await api.get('/grades/stats/')
        gradesStats = r.data || { passing: 0, failing: 0, average: 0 }
      } catch(e) { console.error('Error fetching grades stats:', e) }
      
      // Obtener estadísticas de asistencia
      let attendanceStats = { total: 0, present: 0, absent: 0, late: 0 }
      try {
        const r = await api.get('/attendance/stats/')
        attendanceStats = r.data || { total: 0, present: 0, absent: 0, late: 0 }
      } catch(e) { console.error('Error fetching attendance stats:', e) }
      
      const totalStudents = users.filter(u => u.role === 'student').length
      const passingRate = totalStudents > 0 ? Math.round((gradesStats.passing / totalStudents) * 100) : 0
      const attendanceRate = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0
      
      setStats({
        users: {
          total: users.length,
          teachers: users.filter(u => u.role === 'teacher').length,
          students: totalStudents,
          parents: users.filter(u => u.role === 'parent').length,
          admins: users.filter(u => u.role === 'admin').length
        },
        academics: {
          classes: classes.length,
          subjects: subjects.length,
          periods: 4
        },
        grades: {
          total: gradesStats.total || 0,
          average: gradesStats.average || 0,
          passing: gradesStats.passing || 0,
          failing: gradesStats.failing || 0,
          passingRate: passingRate
        },
        attendance: {
          total: attendanceStats.total || 0,
          present: attendanceStats.present || 0,
          absent: attendanceStats.absent || 0,
          late: attendanceStats.late || 0,
          rate: attendanceRate
        }
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setError('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      borderRadius: '14px', 
      border: '0.5px solid #E0DDD8',
      height: '100%'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Instrument Serif", serif', color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#AAA', mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          startIcon={<ArrowBack />}
          sx={{ borderRadius: '8px' }}
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontFamily: '"Instrument Serif", serif' }}>
          Estadísticas del Sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* Usuarios */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <People sx={{ fontSize: 20 }} />
        Usuarios
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Total" value={stats.users.total} icon={<People fontSize="large" />} color="#1A1A2E" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Administradores" value={stats.users.admins} icon={<People fontSize="large" />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Profesores" value={stats.users.teachers} icon={<School fontSize="large" />} color="#6C63FF" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Estudiantes" value={stats.users.students} icon={<Grade fontSize="large" />} color="#4ECDC4" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Acudientes" value={stats.users.parents} icon={<People fontSize="large" />} color="#F59E0B" />
        </Grid>
      </Grid>

      {/* Académico */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <School sx={{ fontSize: 20 }} />
        Académico
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Clases" value={stats.academics.classes} icon={<School fontSize="large" />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Materias" value={stats.academics.subjects} icon={<Book fontSize="large" />} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Periodos" value={stats.academics.periods} icon={<BarChart fontSize="large" />} color="#6C63FF" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Promedio General" value={`${stats.grades.average}`} icon={<TrendingUp fontSize="large" />} color="#F59E0B" subtitle="Sobre 100" />
        </Grid>
      </Grid>

      {/* Calificaciones */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Grade sx={{ fontSize: 20 }} />
        Calificaciones
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Calificaciones" value={stats.grades.total} icon={<Grade fontSize="large" />} color="#1A1A2E" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Aprobados" value={stats.grades.passing} icon={<TrendingUp fontSize="large" />} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Reprobados" value={stats.grades.failing} icon={<TrendingDown fontSize="large" />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Tasa de Aprobación" value={`${stats.grades.passingRate}%`} icon={<PieChart fontSize="large" />} color="#6C63FF" />
        </Grid>
      </Grid>

      {/* Asistencia */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventNote sx={{ fontSize: 20 }} />
        Asistencia
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Registros" value={stats.attendance.total} icon={<EventNote fontSize="large" />} color="#1A1A2E" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Presentes" value={stats.attendance.present} icon={<CheckCircle fontSize="large" />} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Ausentes" value={stats.attendance.absent} icon={<Cancel fontSize="large" />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Tasa de Asistencia" value={`${stats.attendance.rate}%`} icon={<PieChart fontSize="large" />} color="#6C63FF" />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="caption" sx={{ color: '#AAA' }}>
          Última actualización: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Box>
  )
}

// Importar iconos faltantes
import Book from '@mui/icons-material/Book'
import TrendingDown from '@mui/icons-material/TrendingDown'
import EventNote from '@mui/icons-material/EventNote'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Cancel from '@mui/icons-material/Cancel'

export default AdminStatistics