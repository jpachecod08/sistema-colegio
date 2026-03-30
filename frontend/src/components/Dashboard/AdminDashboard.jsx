import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import {
  PeopleOutlined,
  SchoolOutlined,
  ClassOutlined,
  PersonAddOutlined,
  AssignmentOutlined,
  SettingsOutlined,
  BarChartOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import AdminUsers from '../admin/AdminUsers';
import AdminClasses from '../admin/AdminClasses';
import AdminSubjects from '../admin/AdminSubjects';
import AdminSettings from '../admin/AdminSettings';
import AdminReports from '../admin/AdminReports';
import AdminStatistics from '../admin/AdminStatistics';
import AdminAssignments from '../admin/AdminAssignments';
import AdminEnrollments from '../admin/AdminEnrollments';

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

// ── Sub-componentes ───────────────────────────────────────────────────────────

const StatTile = ({ label, value, sub, accent }) => (
  <Box
    sx={{
      p: '20px 22px',
      borderRadius: '14px',
      border: '0.5px solid',
      borderColor: 'divider',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    }}
  >
    <Typography sx={{ fontSize: 12, color: '#888', letterSpacing: '0.02em' }}>{label}</Typography>
    <Typography
      sx={{
        fontFamily: '"Instrument Serif", serif',
        fontSize: 38,
        color: accent || '#1A1A2E',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: 11, color: '#10B981', mt: 0.25 }}>{sub}</Typography>
    )}
  </Box>
)

const QuickAction = ({ icon, label, desc, onClick, color = '#1A1A2E' }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: '14px 16px',
      borderRadius: '12px',
      border: '0.5px solid',
      borderColor: 'divider',
      background: '#fff',
      cursor: 'pointer',
      transition: 'all .15s',
      '&:hover': {
        borderColor: color,
        background: `${color}08`,
        transform: 'translateX(3px)',
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '9px',
        background: `${color}12`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 18 } })}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>{label}</Typography>
      {desc && (
        <Typography sx={{ fontSize: 11, color: '#AAA', mt: 0.1 }}>{desc}</Typography>
      )}
    </Box>
    <ArrowForwardOutlined sx={{ fontSize: 14, color: '#CCC', flexShrink: 0 }} />
  </Box>
)

// ── Componente de actividad reciente ──
const RecentActivity = ({ activities, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography sx={{ fontSize: 13, color: '#AAA' }}>
          No hay actividad reciente
        </Typography>
      </Box>
    )
  }

  const getIconByType = (type) => {
    switch(type) {
      case 'user': return <PersonAddOutlined />
      case 'class': return <ClassOutlined />
      case 'grade': return <AssignmentOutlined />
      case 'system': return <SchoolOutlined />
      default: return <PeopleOutlined />
    }
  }

  const getTagColor = (type) => {
    switch(type) {
      case 'user': return '#6C63FF'
      case 'class': return '#4ECDC4'
      case 'grade': return '#F59E0B'
      case 'system': return '#10B981'
      default: return '#EF4444'
    }
  }

  return (
    <Box>
      {activities.map((activity, index) => (
        <Box
          key={activity.id || index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.5,
            borderBottom: index < activities.length - 1 ? '0.5px solid #F5F3EE' : 'none',
            '&:last-child': { borderBottom: 'none', pb: 0 },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: `${getTagColor(activity.type)}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getTagColor(activity.type),
              flexShrink: 0,
            }}
          >
            {React.cloneElement(getIconByType(activity.type), { sx: { fontSize: 15 } })}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, color: '#1A1A2E' }}>{activity.title}</Typography>
            <Typography sx={{ fontSize: 11, color: '#AAA' }}>{activity.time}</Typography>
          </Box>
          <Box
            sx={{
              px: 1.25,
              py: 0.4,
              borderRadius: '20px',
              background: `${getTagColor(activity.type)}12`,
              color: getTagColor(activity.type),
              fontSize: 11,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {activity.tag}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// ── Componente Dashboard Principal ──
const DashboardHome = ({ stats, navigate, recentActivities, activitiesLoading }) => {
  const { user } = useAuth()

  const approvalRate = stats.totalStudents > 0 
    ? Math.round(((stats.totalStudents - stats.failingStudents) / stats.totalStudents) * 100)
    : 0
    
  const attendanceRate = stats.totalStudents > 0
    ? Math.round(stats.totalAttendance / stats.totalStudents)
    : 0

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 12, color: '#AAA', mb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Panel de administración
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: { xs: 28, sm: 36 },
              color: '#1A1A2E',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            Hola, {user?.first_name || user?.username}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 2,
            py: 1,
            borderRadius: '10px',
            background: '#1A1A2E',
            color: '#fff',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <SettingsOutlined sx={{ fontSize: 14 }} />
          Acceso completo
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(6,1fr)' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <StatTile label="Usuarios" value={stats.totalUsers} />
        <StatTile label="Profesores" value={stats.totalTeachers} accent="#6C63FF" />
        <StatTile label="Estudiantes" value={stats.totalStudents} accent="#4ECDC4" />
        <StatTile label="Acudientes" value={stats.totalParents} accent="#F59E0B" />
        <StatTile label="Clases" value={stats.totalClasses} accent="#EF4444" />
        <StatTile label="Materias" value={stats.totalSubjects} accent="#10B981" />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box sx={{ p: '16px 20px', borderRadius: '14px', border: '0.5px solid', borderColor: 'divider', background: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: '#888' }}>Tasa de aprobación</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#10B981' }}>{approvalRate}%</Typography>
          </Box>
          <Box sx={{ height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: `${approvalRate}%`, height: '100%', background: '#10B981', borderRadius: 2 }} />
          </Box>
        </Box>
        
        <Box sx={{ p: '16px 20px', borderRadius: '14px', border: '0.5px solid', borderColor: 'divider', background: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: '#888' }}>Asistencia promedio</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#6C63FF' }}>{attendanceRate}%</Typography>
          </Box>
          <Box sx={{ height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: `${attendanceRate}%`, height: '100%', background: '#6C63FF', borderRadius: 2 }} />
          </Box>
        </Box>
        
        <Box sx={{ p: '16px 20px', borderRadius: '14px', border: '0.5px solid', borderColor: 'divider', background: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: '#888' }}>Clases activas</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#F59E0B' }}>{stats.activeClasses}</Typography>
          </Box>
          <Box sx={{ height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: `${Math.min((stats.activeClasses / stats.totalClasses) * 100, 100)}%`, height: '100%', background: '#F59E0B', borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box sx={{ p: 2.5, borderRadius: '14px', border: '0.5px solid', borderColor: 'divider', background: '#FAFAF8' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', mb: 2 }}>
            Acciones rápidas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <QuickAction icon={<PersonAddOutlined />} label="Crear usuario" desc="Registrar estudiante, profesor o acudiente" onClick={() => navigate('/admin/users')} color="#6C63FF" />
            <QuickAction icon={<ClassOutlined />} label="Crear clase" desc="Nuevo grado o grupo académico" onClick={() => navigate('/admin/classes')} color="#4ECDC4" />
            <QuickAction icon={<SchoolOutlined />} label="Crear materia" desc="Nueva asignatura" onClick={() => navigate('/admin/subjects')} color="#10B981" />
            <QuickAction icon={<AssignmentOutlined />} label="Generar reportes" desc="Boletines, asistencia, estadísticas" onClick={() => navigate('/admin/reports')} color="#F59E0B" />
            <QuickAction icon={<BarChartOutlined />} label="Ver estadísticas" desc="Rendimiento académico general" onClick={() => navigate('/admin/statistics')} color="#10B981" />
            <QuickAction icon={<SettingsOutlined />} label="Configuración" desc="Periodos, año lectivo, institución" onClick={() => navigate('/admin/settings')} color="#EF4444" />
          </Box>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: '14px', border: '0.5px solid', borderColor: 'divider', background: '#FAFAF8' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>
              Actividad reciente
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#AAA' }}>Últimas 48h</Typography>
          </Box>
          <RecentActivity activities={recentActivities} loading={activitiesLoading} />
        </Box>
      </Box>
    </>
  )
}

// ── Función auxiliar para extraer datos de respuestas paginadas ──
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

// ── Componente para rutas en desarrollo ──
const ComingSoon = ({ title }) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h5" sx={{ fontFamily: '"Instrument Serif", serif', mb: 2 }}>
      🚧 {title}
    </Typography>
    <Typography sx={{ color: '#888' }}>
      Esta funcionalidad estará disponible próximamente.
    </Typography>
  </Box>
)

// ── Componente principal del AdminDashboard ──
const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0, 
    totalTeachers: 0, 
    totalStudents: 0,
    totalParents: 0, 
    totalClasses: 0, 
    totalSubjects: 0,
    activeClasses: 0,
    failingStudents: 0,
    totalAttendance: 0
  })
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    console.log('AdminDashboard - Ruta actual:', location.pathname)
  }, [location])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setActivitiesLoading(true)
      
      try {
        let users = []
        try { 
          const r = await api.get('/users/list/'); 
          users = extractDataFromResponse(r)
        } catch(e) { console.error('Error fetching users:', e) }
        
        let classes = []
        try { 
          const r = await api.get('/academics/grades/'); 
          classes = extractDataFromResponse(r)
        } catch(e) { console.error('Error fetching classes:', e) }
        
        let subjects = []
        try { 
          const r = await api.get('/academics/subjects/'); 
          subjects = extractDataFromResponse(r)
        } catch(e) { console.error('Error fetching subjects:', e) }
        
        let activities = []
        try { 
          const r = await api.get('/logs/recent/'); 
          activities = extractDataFromResponse(r)
        } catch(e) { console.error('Error fetching activities:', e) }
        
        let gradesStats = { passing: 0, failing: 0 }
        try { 
          const r = await api.get('/grades/stats/');
          gradesStats = r.data || { passing: 0, failing: 0 }
        } catch(e) { console.error('Error fetching grades stats:', e) }
        
        let attendanceStats = { total: 0, present: 0 }
        try { 
          const r = await api.get('/attendance/stats/'); 
          attendanceStats = r.data || { total: 0, present: 0 }
        } catch(e) { console.error('Error fetching attendance stats:', e) }
        
        const totalTeachers = users.filter(u => u.role === 'teacher').length
        const totalStudents = users.filter(u => u.role === 'student').length
        const totalParents = users.filter(u => u.role === 'parent').length
        
        setStats({
          totalUsers: users.length,
          totalTeachers: totalTeachers,
          totalStudents: totalStudents,
          totalParents: totalParents,
          totalClasses: classes.length,
          totalSubjects: subjects.length,
          activeClasses: classes.filter(c => c.is_active !== false).length,
          failingStudents: gradesStats.failing || 0,
          totalAttendance: attendanceStats.total > 0 
            ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
            : 0
        })
        
        setRecentActivities(activities)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally { 
        setLoading(false)
        setActivitiesLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const renderContent = () => {
    const path = location.pathname
    
    // Dashboard principal
    if (path === '/admin' || path === '/admin/') {
      return (
        <DashboardHome 
          stats={stats} 
          navigate={navigate} 
          recentActivities={recentActivities}
          activitiesLoading={activitiesLoading}
        />
      )
    }
    
    // Módulos completos
    if (path.includes('/admin/users')) return <AdminUsers />
    if (path.includes('/admin/classes')) return <AdminClasses />
    if (path.includes('/admin/subjects')) return <AdminSubjects />
    if (path.includes('/admin/reports')) return <AdminReports />
    if (path.includes('/admin/statistics')) return <AdminStatistics />
    if (path.includes('/admin/settings')) return <AdminSettings />
    if (path.includes('/admin/assignments')) return <AdminAssignments />
    if (path.includes('/admin/enrollments')) return <AdminEnrollments />
    
    // Módulos en desarrollo
    if (path.includes('/admin/grades')) return <ComingSoon title="Calificaciones" />
    if (path.includes('/admin/attendance')) return <ComingSoon title="Asistencia" />
    if (path.includes('/admin/report-card')) return <ComingSoon title="Boletines" />
    
    // Por defecto
    return (
      <DashboardHome 
        stats={stats} 
        navigate={navigate} 
        recentActivities={recentActivities}
        activitiesLoading={activitiesLoading}
      />
    )
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
      <CircularProgress size={28} />
    </Box>
  )

  return (
    <>
      <style>{FONT}</style>
      <Box sx={{ fontFamily: '"DM Sans", sans-serif', maxWidth: 1100, pb: 4 }}>
        {renderContent()}
      </Box>
    </>
  )
}

export default AdminDashboard