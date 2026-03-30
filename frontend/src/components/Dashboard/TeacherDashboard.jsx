import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Typography, CircularProgress, FormControl, 
  InputLabel, Select, MenuItem, Grid, Card, CardContent 
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

// ── Sub-componentes ───────────────────────────────────────────────────────────

const KpiCard = ({ label, value, icon, accent = '#1A1A2E', note }) => (
  <Box
    sx={{
      p: '18px 20px',
      borderRadius: '14px',
      border: '0.5px solid',
      borderColor: 'divider',
      background: '#fff',
      display: 'flex',
      gap: 2,
      alignItems: 'flex-start',
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 18px rgba(0,0,0,0.06)' },
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: '10px',
        background: `${accent}12`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent,
        flexShrink: 0,
        mt: '2px',
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 18 } })}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 12, color: '#888', mb: 0.25 }}>{label}</Typography>
      <Typography
        sx={{
          fontFamily: '"Instrument Serif", serif',
          fontSize: 32,
          color: accent,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
      {note && <Typography sx={{ fontSize: 11, color: '#AAA', mt: 0.5 }}>{note}</Typography>}
    </Box>
  </Box>
)

const StudentRow = ({ student, index }) => {
  const { bg, fg } = getAvatarColor(student.student_name || student.full_name || '')
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        borderBottom: '0.5px solid #F5F3EE',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography sx={{ fontSize: 11, color: '#CCC', minWidth: 18 }}>{index + 1}</Typography>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {getInitials(student.student_name || student.full_name || 'E')}
      </Box>
      <Typography sx={{ fontSize: 13, color: '#1A1A2E', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {student.student_name || student.full_name}
      </Typography>
    </Box>
  )
}

const ActivityRow = ({ activity }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      py: 1.25,
      borderBottom: '0.5px solid #F5F3EE',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '8px',
        background: '#FEF3C712',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F59E0B',
        flexShrink: 0,
      }}
    >
      <AssignmentOutlined sx={{ fontSize: 15 }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 13, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {activity.name}
      </Typography>
      <Typography sx={{ fontSize: 11, color: '#AAA' }}>
        {activity.subject_name} · {activity.percentage}% del periodo
      </Typography>
    </Box>
    <Box
      sx={{
        px: 1.25,
        py: 0.4,
        borderRadius: '20px',
        background: '#FEF3C7',
        color: '#92400E',
        fontSize: 11,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      Pendiente
    </Box>
  </Box>
)

// ── Dashboard ─────────────────────────────────────────────────────────────────

const TeacherDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
      // Filtrar estudiantes por la clase seleccionada
      const filtered = allStudents.filter(s => s.grade_id === selectedClass || s.grade === selectedClass)
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents(allStudents)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // Obtener asignaciones del profesor (materias que dicta)
      let assignmentsData = []
      try {
        const r = await api.get('/academics/my-assignments/')
        assignmentsData = Array.isArray(r.data) ? r.data : (r.data?.results || [])
        setAssignments(assignmentsData)
        setStats(prev => ({ ...prev, totalSubjects: assignmentsData.length }))
        
        // Seleccionar primera clase por defecto
        if (assignmentsData.length > 0 && !selectedClass) {
          setSelectedClass(assignmentsData[0].grade_id)
        }
      } catch(e) { console.error('Error fetching assignments:', e) }
      
      // Obtener estudiantes del profesor
      try {
        const r = await api.get('/academics/my-students/')
        const studentsData = Array.isArray(r.data) ? r.data : (r.data?.results || [])
        setAllStudents(studentsData)
        setStats(prev => ({ ...prev, totalStudents: studentsData.length }))
      } catch(e) { console.error('Error fetching students:', e) }
      
      // Obtener actividades pendientes
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
      <Box sx={{ fontFamily: '"DM Sans", sans-serif', maxWidth: 1100, pb: 4 }}>

        {/* ── Encabezado ── */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 12, color: '#AAA', mb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Panel del profesor
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
            Bienvenido, {user?.first_name || user?.username}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#AAA', mt: 0.5 }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>

        {/* ── KPIs ── */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Estudiantes" value={filteredStudents.length} icon={<PeopleOutlined />} accent="#6C63FF" note="En esta clase" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Materias" value={assignments.length} icon={<MenuBookOutlined />} accent="#4ECDC4" note="Este periodo" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Actividades" value={activities.length} icon={<AssignmentOutlined />} accent="#F59E0B" note="Creadas" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Sin calificar" value={stats.pendingGrades} icon={<GradeOutlined />} accent={stats.pendingGrades > 0 ? '#EF4444' : '#10B981'} note={stats.pendingGrades > 0 ? 'Requieren atención' : 'Al día'} />
          </Grid>
        </Grid>

        {/* ── Selector de Clase ── */}
        {assignments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
              <InputLabel>Clase / Materia</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Clase / Materia"
              >
                {assignments.map((cls) => (
                  <MenuItem key={cls.id} value={cls.grade_id}>
                    {cls.subject_name} — {cls.grade_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* ── Acceso rápido a módulos ── */}
        <Grid container spacing={1.25} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/teacher/attendance')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: '14px 18px',
                borderRadius: '12px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all .15s',
                '&:hover': { borderColor: '#6C63FF', background: '#6C63FF06', transform: 'translateY(-2px)', boxShadow: '0 4px 16px #6C63FF20' },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: '#6C63FF12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6C63FF',
                  flexShrink: 0,
                }}
              >
                <ChecklistOutlined sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>Tomar asistencia hoy</Typography>
                <Typography sx={{ fontSize: 12, color: '#AAA' }}>Registra la asistencia de tus clases</Typography>
              </Box>
              <ArrowForwardOutlined sx={{ fontSize: 16, color: '#CCC' }} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/teacher/grades')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: '14px 18px',
                borderRadius: '12px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all .15s',
                '&:hover': { borderColor: '#4ECDC4', background: '#4ECDC406', transform: 'translateY(-2px)', boxShadow: '0 4px 16px #4ECDC420' },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: '#4ECDC412',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ECDC4',
                  flexShrink: 0,
                }}
              >
                <GradeOutlined sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>Gestionar calificaciones</Typography>
                <Typography sx={{ fontSize: 12, color: '#AAA' }}>Ingresa y revisa notas por actividad</Typography>
              </Box>
              <ArrowForwardOutlined sx={{ fontSize: 16, color: '#CCC' }} />
            </Box>
          </Grid>
        </Grid>

        {/* ── Dos columnas ── */}
        <Grid container spacing={2}>
          {/* Mis estudiantes */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '14px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#FAFAF8',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>
                  Mis estudiantes {currentClass && `- ${currentClass.grade_name}`}
                </Typography>
                <Box
                  onClick={() => navigate('/teacher/grades')}
                  sx={{ fontSize: 12, color: '#6C63FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}
                >
                  Ver todos <ArrowForwardOutlined sx={{ fontSize: 12 }} />
                </Box>
              </Box>
              {filteredStudents.length === 0 ? (
                <Box py={3} textAlign="center">
                  <Typography sx={{ fontSize: 13, color: '#AAA' }}>No hay estudiantes en esta clase</Typography>
                </Box>
              ) : (
                filteredStudents.slice(0, 6).map((s, i) => <StudentRow key={s.id || i} student={s} index={i} />)
              )}
              {filteredStudents.length > 6 && (
                <Typography
                  onClick={() => navigate('/teacher/grades')}
                  sx={{ fontSize: 12, color: '#6C63FF', mt: 1.5, cursor: 'pointer', textAlign: 'center' }}
                >
                  + {filteredStudents.length - 6} más
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Actividades pendientes */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '14px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: '#FAFAF8',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>
                  Actividades pendientes
                </Typography>
                <Box
                  onClick={() => navigate('/teacher/grades')}
                  sx={{ fontSize: 12, color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}
                >
                  Calificar <ArrowForwardOutlined sx={{ fontSize: 12 }} />
                </Box>
              </Box>
              {activities.length === 0 ? (
                <Box py={3} textAlign="center">
                  <Typography sx={{ fontSize: 13, color: '#AAA' }}>¡Todo al día! No hay pendientes.</Typography>
                </Box>
              ) : (
                activities.slice(0, 5).map((a, i) => <ActivityRow key={a.id || i} activity={a} />)
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default TeacherDashboard