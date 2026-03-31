import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Typography, CircularProgress, FormControl, 
  InputLabel, Select, MenuItem, Grid, Card, CardContent,
  useMediaQuery, useTheme
} from '@mui/material'
import {
  PeopleOutlined,
  MenuBookOutlined,
  GradeOutlined,
  AssignmentOutlined,
  ChecklistOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const getAvatarColor = (name = '') => {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 13) % 360
  return { bg: `hsl(${hue},42%,90%)`, fg: `hsl(${hue},42%,28%)` }
}

// ── Sub-componentes optimizados ───────────────────────────────────────────

const KpiCard = ({ label, value, icon, accent = '#1A1A2E', note }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Box
      sx={{
        p: { xs: '12px 14px', sm: '14px 16px', md: '18px 20px' },
        borderRadius: { xs: '12px', sm: '13px', md: '14px' },
        border: '0.5px solid',
        borderColor: 'divider',
        background: '#fff',
        display: 'flex',
        gap: { xs: 1.5, sm: 2 },
        alignItems: 'flex-start',
        transition: 'box-shadow .15s',
        '&:hover': { boxShadow: '0 4px 18px rgba(0,0,0,0.06)' },
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: { xs: 32, sm: 35, md: 38 },
          height: { xs: 32, sm: 35, md: 38 },
          borderRadius: { xs: '8px', sm: '9px', md: '10px' },
          background: `${accent}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          flexShrink: 0,
          mt: '2px',
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: { xs: 16, sm: 17, md: 18 } } })}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ 
          fontSize: { xs: 10, sm: 11, md: 12 }, 
          color: '#888', 
          mb: 0.25 
        }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: { xs: 24, sm: 28, md: 32 },
            color: accent,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
        {note && (
          <Typography sx={{ 
            fontSize: { xs: 9, sm: 10, md: 11 }, 
            color: '#AAA', 
            mt: 0.5,
            lineHeight: 1.2
          }}>
            {note}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

const StudentRow = ({ student, index }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { bg, fg } = getAvatarColor(student.student_name || student.full_name || '')
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 },
        py: { xs: 1, sm: 1.25 },
        borderBottom: '0.5px solid #F5F3EE',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography sx={{ 
        fontSize: { xs: 10, sm: 11 }, 
        color: '#CCC', 
        minWidth: { xs: 14, sm: 18 } 
      }}>
        {index + 1}
      </Typography>
      <Box
        sx={{
          width: { xs: 24, sm: 26, md: 28 },
          height: { xs: 24, sm: 26, md: 28 },
          borderRadius: '50%',
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: 9, sm: 9.5, md: 10 },
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {getInitials(student.student_name || student.full_name || 'E')}
      </Box>
      <Typography sx={{ 
        fontSize: { xs: 12, sm: 12.5, md: 13 }, 
        color: '#1A1A2E', 
        flex: 1, 
        minWidth: 0, 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap' 
      }}>
        {student.student_name || student.full_name}
      </Typography>
      {!isMobile && (
        <Box sx={{ minWidth: 24 }} />
      )}
    </Box>
  )
}

const ActivityRow = ({ activity }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
        py: { xs: 1.2, sm: 1.25 },
        borderBottom: '0.5px solid #F5F3EE',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        <Box
          sx={{
            width: { xs: 28, sm: 30, md: 32 },
            height: { xs: 28, sm: 30, md: 32 },
            borderRadius: { xs: '7px', sm: '7.5px', md: '8px' },
            background: '#FEF3C712',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F59E0B',
            flexShrink: 0,
          }}
        >
          <AssignmentOutlined sx={{ fontSize: { xs: 13, sm: 14, md: 15 } }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ 
            fontSize: { xs: 12, sm: 12.5, md: 13 }, 
            color: '#1A1A2E', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {activity.name}
          </Typography>
          <Typography sx={{ 
            fontSize: { xs: 10, sm: 10.5, md: 11 }, 
            color: '#AAA' 
          }}>
            {activity.subject_name} · {activity.percentage}% del periodo
          </Typography>
        </Box>
        <Box
          sx={{
            px: { xs: 0.75, sm: 1, md: 1.25 },
            py: { xs: 0.3, sm: 0.35, md: 0.4 },
            borderRadius: '20px',
            background: '#FEF3C7',
            color: '#92400E',
            fontSize: { xs: 9, sm: 10, md: 11 },
            fontWeight: 500,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Pendiente
        </Box>
      </Box>
    </Box>
  )
}

// ── Dashboard Principal Optimizado ─────────────────────────────────────────────────

const TeacherDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  const [loading, setLoading] = useState(true)
  const [allStudents, setAllStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [activities, setActivities] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [stats, setStats] = useState({ totalStudents: 0, totalSubjects: 0, pendingGrades: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterStudentsByClass()
  }, [selectedClass, allStudents])

  const filterStudentsByClass = () => {
    if (selectedClass && allStudents.length > 0) {
      const filtered = allStudents.filter(s => s.grade_id === selectedClass || s.grade === selectedClass)
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents(allStudents)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      let assignmentsData = []
      try {
        const r = await api.get('/academics/my-assignments/')
        assignmentsData = Array.isArray(r.data) ? r.data : (r.data?.results || [])
        setAssignments(assignmentsData)
        setStats(prev => ({ ...prev, totalSubjects: assignmentsData.length }))
        
        if (assignmentsData.length > 0 && !selectedClass) {
          setSelectedClass(assignmentsData[0].grade_id)
        }
      } catch(e) { console.error('Error fetching assignments:', e) }
      
      try {
        const r = await api.get('/academics/my-students/')
        const studentsData = Array.isArray(r.data) ? r.data : (r.data?.results || [])
        setAllStudents(studentsData)
        setStats(prev => ({ ...prev, totalStudents: studentsData.length }))
      } catch(e) { console.error('Error fetching students:', e) }
      
      try {
        const r = await api.get('/grades/my-activities/')
        const activitiesData = Array.isArray(r.data) ? r.data : (r.data?.results || [])
        setActivities(activitiesData)
        setStats(prev => ({ ...prev, pendingGrades: activitiesData.length }))
      } catch(e) { console.error('Error fetching activities:', e) }
      
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    } finally { 
      setLoading(false)
    }
  }

  const getCurrentClassInfo = () => {
    return assignments.find(a => a.grade_id === selectedClass) || null
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
      <CircularProgress size={28} />
    </Box>
  )

  const currentClass = getCurrentClassInfo()

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

        {/* ── Encabezado optimizado ── */}
        <Box sx={{ mb: { xs: 3, sm: 3.5, md: 4 } }}>
          <Typography sx={{ 
            fontSize: { xs: 10, sm: 11, md: 12 }, 
            color: '#AAA', 
            mb: 0.5, 
            letterSpacing: '0.06em', 
            textTransform: 'uppercase' 
          }}>
            Panel del profesor
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
            Bienvenido, {user?.first_name || user?.username}
          </Typography>
          <Typography sx={{ 
            fontSize: { xs: 11, sm: 12, md: 13 }, 
            color: '#AAA', 
            mt: 0.5 
          }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>

        {/* ── KPIs optimizados ── */}
        <Grid container spacing={1.5} sx={{ mb: { xs: 2.5, sm: 3 } }}>
          <Grid item xs={6} sm={3}>
            <KpiCard 
              label="Estudiantes" 
              value={filteredStudents.length} 
              icon={<PeopleOutlined />} 
              accent="#6C63FF" 
              note={isMobile ? "Esta clase" : "En esta clase"} 
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard 
              label="Materias" 
              value={assignments.length} 
              icon={<MenuBookOutlined />} 
              accent="#4ECDC4" 
              note={isMobile ? "Periodo" : "Este periodo"} 
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard 
              label="Actividades" 
              value={activities.length} 
              icon={<AssignmentOutlined />} 
              accent="#F59E0B" 
              note={isMobile ? "Creadas" : "Creadas"} 
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard 
              label="Sin calificar" 
              value={stats.pendingGrades} 
              icon={<GradeOutlined />} 
              accent={stats.pendingGrades > 0 ? '#EF4444' : '#10B981'} 
              note={stats.pendingGrades > 0 ? (isMobile ? "Requieren" : "Requieren atención") : 'Al día'} 
            />
          </Grid>
        </Grid>

        {/* ── Selector de Clase optimizado ── */}
        {assignments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <FormControl 
              fullWidth={isMobile} 
              size="small" 
              sx={{ 
                maxWidth: { xs: '100%', sm: 350, md: 400 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Clase / Materia
              </InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Clase / Materia"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {assignments.map((cls) => (
                  <MenuItem key={cls.id} value={cls.grade_id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {isMobile 
                      ? `${cls.subject_name} - ${cls.grade_name}`
                      : `${cls.subject_name} — ${cls.grade_name}`
                    }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* ── Acceso rápido a módulos optimizado ── */}
        <Grid container spacing={1.25} sx={{ mb: { xs: 2.5, sm: 3 } }}>
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/teacher/attendance')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                p: { xs: '10px 14px', sm: '12px 16px', md: '14px 18px' },
                borderRadius: { xs: '10px', sm: '11px', md: '12px' },
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all .15s',
                '&:hover': { 
                  borderColor: '#6C63FF', 
                  background: '#6C63FF06', 
                  transform: { xs: 'none', sm: 'translateY(-2px)' },
                  boxShadow: { sm: '0 4px 16px #6C63FF20' }
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36, md: 40 },
                  height: { xs: 32, sm: 36, md: 40 },
                  borderRadius: { xs: '8px', sm: '9px', md: '10px' },
                  background: '#6C63FF12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6C63FF',
                  flexShrink: 0,
                }}
              >
                <ChecklistOutlined sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ 
                  fontSize: { xs: 12, sm: 13, md: 14 }, 
                  fontWeight: 500, 
                  color: '#1A1A2E' 
                }}>
                  Tomar asistencia hoy
                </Typography>
                {!isMobile && (
                  <Typography sx={{ fontSize: { xs: 11, sm: 11.5, md: 12 }, color: '#AAA' }}>
                    Registra la asistencia de tus clases
                  </Typography>
                )}
              </Box>
              <ArrowForwardOutlined sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, color: '#CCC', flexShrink: 0 }} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/teacher/grades')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                p: { xs: '10px 14px', sm: '12px 16px', md: '14px 18px' },
                borderRadius: { xs: '10px', sm: '11px', md: '12px' },
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all .15s',
                '&:hover': { 
                  borderColor: '#4ECDC4', 
                  background: '#4ECDC406', 
                  transform: { xs: 'none', sm: 'translateY(-2px)' },
                  boxShadow: { sm: '0 4px 16px #4ECDC420' }
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36, md: 40 },
                  height: { xs: 32, sm: 36, md: 40 },
                  borderRadius: { xs: '8px', sm: '9px', md: '10px' },
                  background: '#4ECDC412',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ECDC4',
                  flexShrink: 0,
                }}
              >
                <GradeOutlined sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ 
                  fontSize: { xs: 12, sm: 13, md: 14 }, 
                  fontWeight: 500, 
                  color: '#1A1A2E' 
                }}>
                  Gestionar calificaciones
                </Typography>
                {!isMobile && (
                  <Typography sx={{ fontSize: { xs: 11, sm: 11.5, md: 12 }, color: '#AAA' }}>
                    Ingresa y revisa notas por actividad
                  </Typography>
                )}
              </Box>
              <ArrowForwardOutlined sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, color: '#CCC', flexShrink: 0 }} />
            </Box>
          </Grid>
        </Grid>

        {/* ── Dos columnas optimizadas ── */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {/* Mis estudiantes */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: '14px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#FAFAF8',
                height: '100%',
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 0 },
                mb: 2 
              }}>
                <Typography sx={{ 
                  fontSize: { xs: 12, sm: 12.5, md: 13 }, 
                  fontWeight: 500, 
                  color: '#1A1A2E' 
                }}>
                  Mis estudiantes {currentClass && `- ${currentClass.grade_name}`}
                </Typography>
                <Box
                  onClick={() => navigate('/teacher/grades')}
                  sx={{ 
                    fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                    color: '#6C63FF', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Ver todos <ArrowForwardOutlined sx={{ fontSize: { xs: 11, sm: 12 } }} />
                </Box>
              </Box>
              {filteredStudents.length === 0 ? (
                <Box py={{ xs: 2, sm: 3 }} textAlign="center">
                  <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#AAA' }}>
                    No hay estudiantes en esta clase
                  </Typography>
                </Box>
              ) : (
                filteredStudents.slice(0, isMobile ? 4 : 6).map((s, i) => (
                  <StudentRow key={s.id || i} student={s} index={i} />
                ))
              )}
              {filteredStudents.length > (isMobile ? 4 : 6) && (
                <Typography
                  onClick={() => navigate('/teacher/grades')}
                  sx={{ 
                    fontSize: { xs: 11, sm: 12 }, 
                    color: '#6C63FF', 
                    mt: 1.5, 
                    cursor: 'pointer', 
                    textAlign: 'center' 
                  }}
                >
                  + {filteredStudents.length - (isMobile ? 4 : 6)} más
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Actividades pendientes */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: '14px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#FAFAF8',
                height: '100%',
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 0 },
                mb: 2 
              }}>
                <Typography sx={{ 
                  fontSize: { xs: 12, sm: 12.5, md: 13 }, 
                  fontWeight: 500, 
                  color: '#1A1A2E' 
                }}>
                  Actividades pendientes
                </Typography>
                <Box
                  onClick={() => navigate('/teacher/grades')}
                  sx={{ 
                    fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                    color: '#F59E0B', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Calificar <ArrowForwardOutlined sx={{ fontSize: { xs: 11, sm: 12 } }} />
                </Box>
              </Box>
              {activities.length === 0 ? (
                <Box py={{ xs: 2, sm: 3 }} textAlign="center">
                  <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#AAA' }}>
                    ¡Todo al día! No hay pendientes.
                  </Typography>
                </Box>
              ) : (
                activities.slice(0, isMobile ? 4 : 5).map((a, i) => (
                  <ActivityRow key={a.id || i} activity={a} />
                ))
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default TeacherDashboard