import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, CircularProgress, useMediaQuery, useTheme } from '@mui/material'
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

// ── Sub-componentes optimizados para responsive ───────────────────────────────────────────

const StatTile = ({ label, value, sub, accent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      sx={{
        p: { xs: '12px 14px', sm: '16px 20px', md: '20px 22px' },
        borderRadius: { xs: '10px', sm: '12px', md: '14px' },
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
      <Typography sx={{ 
        fontSize: { xs: 10, sm: 11, md: 12 }, 
        color: '#888', 
        letterSpacing: '0.02em' 
      }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Instrument Serif", serif',
          fontSize: { xs: 24, sm: 32, md: 38 },
          color: accent || '#1A1A2E',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: { xs: 9, sm: 10, md: 11 }, color: '#10B981', mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Box>
  )
}

const QuickAction = ({ icon, label, desc, onClick, color = '#1A1A2E' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        p: { xs: '10px 12px', sm: '12px 14px', md: '14px 16px' },
        borderRadius: { xs: '10px', sm: '11px', md: '12px' },
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
          width: { xs: 28, sm: 32, md: 36 },
          height: { xs: 28, sm: 32, md: 36 },
          borderRadius: { xs: '7px', sm: '8px', md: '9px' },
          background: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: { xs: 14, sm: 16, md: 18 } } })}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ 
          fontSize: { xs: 12, sm: 12.5, md: 13 }, 
          fontWeight: 500, 
          color: '#1A1A2E' 
        }}>
          {label}
        </Typography>
        {desc && !isMobile && (
          <Typography sx={{ fontSize: { xs: 10, sm: 10.5, md: 11 }, color: '#AAA', mt: 0.1 }}>
            {desc}
          </Typography>
        )}
        {desc && isMobile && (
          <Typography sx={{ fontSize: 10, color: '#AAA', mt: 0.1 }}>
            {desc.length > 30 ? `${desc.substring(0, 30)}...` : desc}
          </Typography>
        )}
      </Box>
      <ArrowForwardOutlined sx={{ fontSize: { xs: 12, sm: 13, md: 14 }, color: '#CCC', flexShrink: 0 }} />
    </Box>
  )
}

// ── Componente de actividad reciente optimizado ──
const RecentActivity = ({ activities, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
        <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#AAA' }}>
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
      {activities.slice(0, isMobile ? 3 : 5).map((activity, index) => (
        <Box
          key={activity.id || index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            py: { xs: 1.2, sm: 1.5 },
            borderBottom: index < activities.length - 1 ? '0.5px solid #F5F3EE' : 'none',
            '&:last-child': { borderBottom: 'none', pb: 0 },
          }}
        >
          <Box
            sx={{
              width: { xs: 28, sm: 30, md: 32 },
              height: { xs: 28, sm: 30, md: 32 },
              borderRadius: { xs: '7px', sm: '7.5px', md: '8px' },
              background: `${getTagColor(activity.type)}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getTagColor(activity.type),
              flexShrink: 0,
            }}
          >
            {React.cloneElement(getIconByType(activity.type), { sx: { fontSize: { xs: 13, sm: 14, md: 15 } } })}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ 
              fontSize: { xs: 11.5, sm: 12, md: 13 }, 
              color: '#1A1A2E',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {activity.title}
            </Typography>
            <Typography sx={{ fontSize: { xs: 9, sm: 10, md: 11 }, color: '#AAA' }}>
              {activity.time}
            </Typography>
          </Box>
          {!isMobile && (
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
          )}
        </Box>
      ))}
    </Box>
  )
}

// ── Componente Dashboard Principal optimizado ──
const DashboardHome = ({ stats, navigate, recentActivities, activitiesLoading }) => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

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
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          mb: { xs: 3, sm: 3.5, md: 4 },
          gap: { xs: 2, sm: 1 },
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography sx={{ 
            fontSize: { xs: 10, sm: 11, md: 12 }, 
            color: '#AAA', 
            mb: 0.5, 
            letterSpacing: '0.06em', 
            textTransform: 'uppercase' 
          }}>
            Panel de administración
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: { xs: 24, sm: 30, md: 36 },
              color: '#1A1A2E',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              wordBreak: 'break-word',
            }}
          >
            Hola, {user?.first_name || user?.username}
          </Typography>
        </Box>
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: '10px',
            background: '#1A1A2E',
            color: '#fff',
            fontSize: { xs: 10, sm: 11, md: 12 },
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            whiteSpace: 'nowrap',
          }}
        >
          <SettingsOutlined sx={{ fontSize: { xs: 12, sm: 13, md: 14 } }} />
          Acceso completo
        </Box>
      </Box>

      {/* Stats Grid - Responsive */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(3, 1fr)', 
            md: 'repeat(6, 1fr)' 
          },
          gap: { xs: 1, sm: 1.2, md: 1.5 },
          mb: { xs: 2.5, sm: 3 },
        }}
      >
        <StatTile label="Usuarios" value={stats.totalUsers} />
        <StatTile label="Profesores" value={stats.totalTeachers} accent="#6C63FF" />
        <StatTile label="Estudiantes" value={stats.totalStudents} accent="#4ECDC4" />
        <StatTile label="Acudientes" value={stats.totalParents} accent="#F59E0B" />
        <StatTile label="Clases" value={stats.totalClasses} accent="#EF4444" />
        <StatTile label="Materias" value={stats.totalSubjects} accent="#10B981" />
      </Box>

      {/* Progress Cards - Responsive */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: { xs: 1, sm: 1.2, md: 1.5 },
          mb: { xs: 2.5, sm: 3 },
        }}
      >
        <Box sx={{ 
          p: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' }, 
          borderRadius: '14px', 
          border: '0.5px solid', 
          borderColor: 'divider', 
          background: '#fff' 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontSize: { xs: 10, sm: 11, md: 12 }, color: '#888' }}>Tasa de aprobación</Typography>
            <Typography sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 500, color: '#10B981' }}>
              {approvalRate}%
            </Typography>
          </Box>
          <Box sx={{ height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: `${approvalRate}%`, height: '100%', background: '#10B981', borderRadius: 2 }} />
          </Box>
        </Box>
        
        <Box sx={{ 
          p: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' }, 
          borderRadius: '14px', 
          border: '0.5px solid', 
          borderColor: 'divider', 
          background: '#fff' 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontSize: { xs: 10, sm: 11, md: 12 }, color: '#888' }}>Asistencia promedio</Typography>
            <Typography sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 500, color: '#6C63FF' }}>
              {attendanceRate}%
            </Typography>
          </Box>
          <Box sx={{ height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: `${attendanceRate}%`, height: '100%', background: '#6C63FF', borderRadius: 2 }} />
          </Box>
        </Box>
        
        <Box sx={{ 
          p: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' }, 
          borderRadius: '14px', 
          border: '0.5px solid', 
          borderColor: 'divider', 
          background: '#fff' 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography sx={{ fontSize: { xs: 10, sm: 11, md: 12 }, color: '#888' }}>Clases activas</Typography>
            <Typography sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 500, color: '#F59E0B' }}>
              {stats.activeClasses}
            </Typography>
          </Box>
          <Box sx={{ height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ 
              width: `${Math.min((stats.activeClasses / (stats.totalClasses || 1)) * 100, 100)}%`, 
              height: '100%', 
              background: '#F59E0B', 
              borderRadius: 2 
            }} />
          </Box>
        </Box>
      </Box>

      {/* Bottom Sections - Responsive */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1.5, sm: 2 }
      }}>
        <Box sx={{ 
          flex: 1,
          p: { xs: 1.5, sm: 2, md: 2.5 }, 
          borderRadius: '14px', 
          border: '0.5px solid', 
          borderColor: 'divider', 
          background: '#FAFAF8' 
        }}>
          <Typography sx={{ 
            fontSize: { xs: 12, sm: 12.5, md: 13 }, 
            fontWeight: 500, 
            color: '#1A1A2E', 
            mb: 1.5 
          }}>
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

        <Box sx={{ 
          flex: 1,
          p: { xs: 1.5, sm: 2, md: 2.5 }, 
          borderRadius: '14px', 
          border: '0.5px solid', 
          borderColor: 'divider', 
          background: '#FAFAF8' 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ 
              fontSize: { xs: 12, sm: 12.5, md: 13 }, 
              fontWeight: 500, 
              color: '#1A1A2E' 
            }}>
              Actividad reciente
            </Typography>
            <Typography sx={{ fontSize: { xs: 9, sm: 10, md: 11 }, color: '#AAA' }}>
              Últimas 48h
            </Typography>
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
  <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 7, md: 8 } }}>
    <Typography variant="h5" sx={{ fontFamily: '"Instrument Serif", serif', mb: 2, fontSize: { xs: 20, sm: 24, md: 28 } }}>
      🚧 {title}
    </Typography>
    <Typography sx={{ color: '#888', fontSize: { xs: 12, sm: 13, md: 14 } }}>
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
      <Box sx={{ 
        fontFamily: '"DM Sans", sans-serif', 
        maxWidth: { xs: '100%', sm: '95%', md: 1100 },
        width: '100%',
        mx: 'auto',
        px: { xs: 1.5, sm: 2, md: 3 },
        pb: { xs: 3, sm: 4, md: 4 }
      }}>
        {renderContent()}
      </Box>
    </>
  )
}

export default AdminDashboard