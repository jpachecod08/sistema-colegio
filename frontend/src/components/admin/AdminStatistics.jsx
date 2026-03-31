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
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { 
  ArrowBack, 
  BarChart, 
  PieChart, 
  TrendingUp, 
  People, 
  School, 
  Grade,
  Book,
  TrendingDown,
  EventNote,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import api from '../../services/api'

const AdminStatistics = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
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
      
      let users = []
      try {
        const r = await api.get('/users/list/')
        users = extractDataFromResponse(r)
      } catch(e) { console.error('Error fetching users:', e) }
      
      let classes = []
      try {
        const r = await api.get('/academics/grades/')
        classes = extractDataFromResponse(r)
      } catch(e) { console.error('Error fetching classes:', e) }
      
      let subjects = []
      try {
        const r = await api.get('/academics/subjects/')
        subjects = extractDataFromResponse(r)
      } catch(e) { console.error('Error fetching subjects:', e) }
      
      let gradesStats = { passing: 0, failing: 0, average: 0 }
      try {
        const r = await api.get('/grades/stats/')
        gradesStats = r.data || { passing: 0, failing: 0, average: 0 }
      } catch(e) { console.error('Error fetching grades stats:', e) }
      
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
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: { xs: 'none', sm: 'translateY(-2px)' },
        boxShadow: { sm: '0 4px 12px rgba(0,0,0,0.05)' }
      }
    }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: 1
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ 
              color: '#888', 
              mb: 1,
              fontSize: { xs: 11, sm: 12, md: 13 }
            }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ 
              fontFamily: '"Instrument Serif", serif', 
              color,
              fontSize: { xs: 28, sm: 32, md: 40 },
              lineHeight: 1,
              wordBreak: 'break-word'
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ 
                color: '#AAA', 
                mt: 1, 
                display: 'block',
                fontSize: { xs: 9, sm: 10, md: 11 }
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            color, 
            opacity: 0.7,
            flexShrink: 0
          }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: { xs: 28, sm: 32, md: 36 } }
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const SectionTitle = ({ icon, title }) => (
    <Typography variant="h6" sx={{ 
      mb: { xs: 1.5, sm: 2 }, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      fontSize: { xs: 16, sm: 18, md: 20 }
    }}>
      {React.cloneElement(icon, { sx: { fontSize: { xs: 18, sm: 20 } } })}
      {title}
    </Typography>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 2, md: 3 },
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header Responsive */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 2, sm: 2 },
        mb: { xs: 2, sm: 3 }
      }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          startIcon={<ArrowBack />}
          sx={{ 
            borderRadius: '8px',
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 0.75 },
            fontSize: { xs: 12, sm: 13 }
          }}
        >
          Volver
        </Button>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: '"Instrument Serif", serif',
            fontSize: { xs: 20, sm: 28, md: 32 }
          }}
        >
          Estadísticas del Sistema
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')} 
          sx={{ 
            mb: 2, 
            borderRadius: '10px',
            fontSize: { xs: 12, sm: 13 }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Usuarios */}
      <SectionTitle icon={<People />} title="Usuarios" />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Total" value={stats.users.total} icon={<People />} color="#1A1A2E" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Administradores" value={stats.users.admins} icon={<People />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Profesores" value={stats.users.teachers} icon={<School />} color="#6C63FF" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Estudiantes" value={stats.users.students} icon={<Grade />} color="#4ECDC4" />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard title="Acudientes" value={stats.users.parents} icon={<People />} color="#F59E0B" />
        </Grid>
      </Grid>

      {/* Académico */}
      <SectionTitle icon={<School />} title="Académico" />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Clases" value={stats.academics.classes} icon={<School />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Materias" value={stats.academics.subjects} icon={<Book />} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Periodos" value={stats.academics.periods} icon={<BarChart />} color="#6C63FF" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard 
            title="Promedio General" 
            value={`${stats.grades.average}`} 
            icon={<TrendingUp />} 
            color="#F59E0B" 
            subtitle="Sobre 100" 
          />
        </Grid>
      </Grid>

      {/* Calificaciones */}
      <SectionTitle icon={<Grade />} title="Calificaciones" />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Calificaciones" value={stats.grades.total} icon={<Grade />} color="#1A1A2E" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Aprobados" value={stats.grades.passing} icon={<TrendingUp />} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Reprobados" value={stats.grades.failing} icon={<TrendingDown />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Tasa de Aprobación" value={`${stats.grades.passingRate}%`} icon={<PieChart />} color="#6C63FF" />
        </Grid>
      </Grid>

      {/* Asistencia */}
      <SectionTitle icon={<EventNote />} title="Asistencia" />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Registros" value={stats.attendance.total} icon={<EventNote />} color="#1A1A2E" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Presentes" value={stats.attendance.present} icon={<CheckCircle />} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Ausentes" value={stats.attendance.absent} icon={<Cancel />} color="#EF4444" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Tasa de Asistencia" value={`${stats.attendance.rate}%`} icon={<PieChart />} color="#6C63FF" />
        </Grid>
      </Grid>

      <Divider sx={{ my: { xs: 2, sm: 3 } }} />

      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="caption" sx={{ 
          color: '#AAA',
          fontSize: { xs: 10, sm: 11, md: 12 }
        }}>
          Última actualización: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Box>
  )
}

export default AdminStatistics