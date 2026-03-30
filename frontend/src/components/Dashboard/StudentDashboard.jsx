import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Typography, CircularProgress, LinearProgress, 
  Accordion, AccordionSummary, AccordionDetails, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper
} from '@mui/material'
import {
  EmojiEventsOutlined,
  SchoolOutlined,
  MenuBookOutlined,
  ArrowForwardOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  AccessTimeOutlined,
  ExpandMore,
  CalendarToday,
  Percent,
  Grade
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import api from '../../services/api'

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const getScoreStyle = (score, minGrade, maxScore) => {
  if (score === null || score === undefined) return { color: '#AAA', bg: '#F5F3EE', bar: '#E0DDD8' }
  const threshold = minGrade || 60
  if (score >= threshold + 10) return { color: '#27500A', bg: '#EAF3DE', bar: '#639922' }
  if (score >= threshold) return { color: '#633806', bg: '#FAEEDA', bar: '#BA7517' }
  return { color: '#501313', bg: '#FCEBEB', bar: '#A32D2D' }
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

const HeroStat = ({ label, value, accent, note, large }) => (
  <Box
    sx={{
      p: large ? '24px 28px' : '18px 22px',
      borderRadius: '16px',
      border: '0.5px solid',
      borderColor: 'divider',
      background: '#fff',
    }}
  >
    <Typography sx={{ fontSize: 11, color: '#888', mb: 0.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: '"Instrument Serif", serif',
        fontSize: large ? 56 : 40,
        color: accent || '#1A1A2E',
        lineHeight: 1,
        letterSpacing: '-0.03em',
      }}
    >
      {value}
    </Typography>
    {note && (
      <Typography sx={{ fontSize: 12, color: '#AAA', mt: 0.75 }}>{note}</Typography>
    )}
  </Box>
)

// Componente para mostrar actividades de una materia
const SubjectActivities = ({ subject, minGrade, maxScore }) => {
  const { color, bg, bar } = getScoreStyle(subject.final_score, minGrade, maxScore)
  const approved = subject.final_score >= minGrade

  return (
    <Accordion 
      sx={{ 
        mb: 1.5, 
        borderRadius: '12px !important', 
        border: '0.5px solid #E0DDD8',
        boxShadow: 'none',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          borderRadius: '12px',
          '&:hover': { background: '#FAFAF8' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>
              {subject.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(subject.final_score, maxScore)}
                sx={{
                  width: 100,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#F0EDE8',
                  '& .MuiLinearProgress-bar': { borderRadius: 2, backgroundColor: bar }
                }}
              />
              <Typography sx={{ fontSize: 12, fontWeight: 500, color }}>
                {subject.final_score || '—'}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={approved ? 'Aprobado' : subject.final_score === null ? 'Sin calificar' : 'Reprobado'}
            size="small"
            sx={{
              backgroundColor: approved ? '#EAF3DE' : subject.final_score === null ? '#F5F3EE' : '#FCEBEB',
              color: approved ? '#27500A' : subject.final_score === null ? '#888' : '#501313',
              fontWeight: 500
            }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: 'none', border: '0.5px solid #E0DDD8' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Actividad</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'center' }}>Porcentaje</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'center' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'center' }}>Nota</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 11, textAlign: 'center' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subject.activities.map((activity, idx) => {
                const score = activity.score
                const activityStyle = getScoreStyle(score, minGrade, maxScore)
                const isGraded = score !== null && score !== undefined
                
                return (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                        {activity.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 11, color: '#888' }}>
                        {activity.percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 11, color: '#AAA' }} />
                        <Typography sx={{ fontSize: 11, color: '#666' }}>
                          {activity.date ? new Date(activity.date).toLocaleDateString('es-CO') : '—'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {isGraded ? (
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.4,
                            borderRadius: '20px',
                            background: activityStyle.bg,
                            color: activityStyle.color,
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          {score}
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 11, color: '#AAA' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isGraded ? (
                        score >= minGrade ? (
                          <Chip
                            label="Aprobado"
                            size="small"
                            sx={{ backgroundColor: '#EAF3DE', color: '#27500A', height: 20, fontSize: 10 }}
                          />
                        ) : (
                          <Chip
                            label="Reprobado"
                            size="small"
                            sx={{ backgroundColor: '#FCEBEB', color: '#501313', height: 20, fontSize: 10 }}
                          />
                        )
                      ) : (
                        <Chip
                          label="Pendiente"
                          size="small"
                          sx={{ backgroundColor: '#F5F3EE', color: '#888', height: 20, fontSize: 10 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const { user } = useAuth()
  const { settings, getMaxScore } = useSettings()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [subjects, setSubjects] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])

  const minGrade = settings.min_grade || 60
  const maxScore = getMaxScore()

  useEffect(() => {
    const fetch = async () => {
      try {
        const gradesRes = await api.get('/grades/my-grades/')
        const activitiesData = Array.isArray(gradesRes.data) ? gradesRes.data : (gradesRes.data?.results || [])
        setActivities(activitiesData)
        
        const subjectsMap = new Map()
        activitiesData.forEach(act => {
          const subjectName = act.subject_name
          if (!subjectsMap.has(subjectName)) {
            subjectsMap.set(subjectName, {
              name: subjectName,
              activities: [],
              final_score: null
            })
          }
          subjectsMap.get(subjectName).activities.push(act)
        })
        
        const subjectsArray = Array.from(subjectsMap.values()).map(subj => {
          const gradedActivities = subj.activities.filter(a => a.score !== null && a.score !== undefined)
          if (gradedActivities.length > 0) {
            const weightedSum = gradedActivities.reduce((sum, a) => sum + (a.score * (a.percentage / 100)), 0)
            const totalPercentage = gradedActivities.reduce((sum, a) => sum + a.percentage, 0)
            subj.final_score = totalPercentage > 0 ? Math.round((weightedSum / totalPercentage) * maxScore) : null
          } else {
            subj.final_score = null
          }
          return subj
        })
        
        setSubjects(subjectsArray)
        
        const attRes = await api.get('/attendance/my-attendance/')
        setAttendanceRecords(Array.isArray(attRes.data) ? attRes.data : (attRes.data?.results || []))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [maxScore])

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
      <CircularProgress size={28} />
    </Box>
  )

  const allScores = activities.filter(a => a.score !== null).map(a => a.score)
  const avg = allScores.length > 0 ? Math.round(allScores.reduce((s, a) => s + a, 0) / allScores.length) : null
  const approvedSubjects = subjects.filter(s => s.final_score >= minGrade).length
  const failedSubjects = subjects.filter(s => s.final_score !== null && s.final_score < minGrade).length
  const pendingSubjects = subjects.filter(s => s.final_score === null).length

  const total = attendanceRecords.length
  const present = attendanceRecords.filter(r => r.status === 'present').length
  const late = attendanceRecords.filter(r => r.status === 'late').length
  const absent = attendanceRecords.filter(r => r.status === 'absent').length
  const attPct = total > 0 ? Math.round(((present + late) / total) * 100) : null
  const attStyle = attPct !== null ? getScoreStyle(attPct, minGrade, 100) : {}

  return (
    <>
      <style>{FONT}</style>
      <Box sx={{ fontFamily: '"DM Sans", sans-serif', maxWidth: 1000, pb: 4 }}>

        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 12, color: '#AAA', mb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Panel del estudiante
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
            ¡Hola, {user?.first_name || user?.username}!
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '2fr 1fr 1fr' },
            gap: 1.5,
            mb: 3,
          }}
        >
          <HeroStat
            label="Promedio general"
            value={avg !== null ? `${avg} / ${maxScore}` : '—'}
            accent={avg !== null ? getScoreStyle(avg, minGrade, maxScore).color : '#AAA'}
            note={avg !== null ? (avg >= minGrade ? 'Rendimiento aprobatorio' : 'Por debajo del mínimo') : 'Sin calificaciones aún'}
            large
          />
          <HeroStat
            label="Asistencia"
            value={attPct !== null ? `${attPct}%` : '—'}
            accent={attPct !== null ? attStyle.color : '#AAA'}
            note={total > 0 ? `${total} clases registradas` : 'Sin registros'}
          />
          <HeroStat
            label="Materias"
            value={subjects.length}
            accent="#6C63FF"
            note={`${approvedSubjects} aprobadas / ${failedSubjects} en riesgo${pendingSubjects > 0 ? ` / ${pendingSubjects} pendientes` : ''}`}
          />
        </Box>

        {total > 0 && (
          <Box
            sx={{
              p: '16px 20px',
              borderRadius: '14px',
              border: '0.5px solid',
              borderColor: 'divider',
              background: '#fff',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>Resumen de asistencia</Typography>
              <Box
                onClick={() => navigate('/attendance')}
                sx={{ fontSize: 12, color: '#6C63FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                Ver historial <ArrowForwardOutlined sx={{ fontSize: 12 }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              {[
                { label: 'Presentes', value: present, color: '#27500A', bg: '#EAF3DE', icon: <CheckCircleOutlined sx={{ fontSize: 14 }} /> },
                { label: 'Tardanzas', value: late, color: '#633806', bg: '#FAEEDA', icon: <AccessTimeOutlined sx={{ fontSize: 14 }} /> },
                { label: 'Ausencias', value: absent, color: '#501313', bg: '#FCEBEB', icon: <CancelOutlined sx={{ fontSize: 14 }} /> },
              ].map(s => (
                <Box
                  key={s.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '8px',
                    background: s.bg,
                    color: s.color,
                  }}
                >
                  {s.icon}
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: s.color }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 11, color: s.color, opacity: 0.75 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, height: 5, background: '#F0EDE8', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ width: `${attPct}%`, height: '100%', background: attStyle.bar, borderRadius: 3 }} />
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: attStyle.color, minWidth: 34 }}>
                {attPct}%
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            p: 2.5,
            borderRadius: '14px',
            border: '0.5px solid',
            borderColor: 'divider',
            background: '#FAFAF8',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>
              Mis calificaciones
            </Typography>
            <Box
              onClick={() => navigate('/grades')}
              sx={{ fontSize: 12, color: '#6C63FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              Ver detalle completo <ArrowForwardOutlined sx={{ fontSize: 12 }} />
            </Box>
          </Box>
          
          {subjects.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography sx={{ fontSize: 13, color: '#AAA' }}>No hay calificaciones registradas aún</Typography>
            </Box>
          ) : (
            subjects.map((subject, idx) => (
              <SubjectActivities key={idx} subject={subject} minGrade={minGrade} maxScore={maxScore} />
            ))
          )}
        </Box>
      </Box>
    </>
  )
}

export default StudentDashboard