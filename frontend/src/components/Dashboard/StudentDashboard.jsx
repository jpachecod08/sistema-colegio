import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, Typography, CircularProgress, LinearProgress, 
  Accordion, AccordionSummary, AccordionDetails, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, useMediaQuery, useTheme
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

// ── Sub-componentes optimizados ───────────────────────────────────────────

const HeroStat = ({ label, value, accent, note, large }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Box
      sx={{
        p: large 
          ? { xs: '16px 18px', sm: '20px 24px', md: '24px 28px' }
          : { xs: '14px 16px', sm: '16px 20px', md: '18px 22px' },
        borderRadius: { xs: '12px', sm: '14px', md: '16px' },
        border: '0.5px solid',
        borderColor: 'divider',
        background: '#fff',
      }}
    >
      <Typography sx={{ 
        fontSize: { xs: 10, sm: 10.5, md: 11 }, 
        color: '#888', 
        mb: 0.5, 
        letterSpacing: '0.04em', 
        textTransform: 'uppercase' 
      }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Instrument Serif", serif',
          fontSize: large 
            ? { xs: 36, sm: 48, md: 56 }
            : { xs: 28, sm: 34, md: 40 },
          color: accent || '#1A1A2E',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
      {note && (
        <Typography sx={{ 
          fontSize: { xs: 10, sm: 11, md: 12 }, 
          color: '#AAA', 
          mt: 0.75,
          lineHeight: 1.3
        }}>
          {note}
        </Typography>
      )}
    </Box>
  )
}

// Componente para mostrar actividades de una materia - OPTIMIZADO
const SubjectActivities = ({ subject, minGrade, maxScore }) => {
  const { color, bg, bar } = getScoreStyle(subject.final_score, minGrade, maxScore)
  const approved = subject.final_score >= minGrade
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

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
          px: { xs: 1.5, sm: 2 },
          '&:hover': { background: '#FAFAF8' }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 1, sm: 2 }, 
          flex: 1 
        }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography sx={{ 
              fontSize: { xs: 13, sm: 13.5, md: 14 }, 
              fontWeight: 500, 
              color: '#1A1A2E',
              wordBreak: 'break-word'
            }}>
              {subject.name}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mt: 0.5,
              flexWrap: 'wrap'
            }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(subject.final_score, maxScore)}
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#F0EDE8',
                  '& .MuiLinearProgress-bar': { borderRadius: 2, backgroundColor: bar }
                }}
              />
              <Typography sx={{ 
                fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                fontWeight: 500, 
                color 
              }}>
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
              fontWeight: 500,
              fontSize: { xs: 10, sm: 11 }
            }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2, px: { xs: 1, sm: 2 } }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '10px', 
            boxShadow: 'none', 
            border: '0.5px solid #E0DDD8',
            overflowX: 'auto'
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 } }}>Actividad</TableCell>
                {!isMobile && (
                  <>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, textAlign: 'center' }}>%</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, textAlign: 'center' }}>Fecha</TableCell>
                  </>
                )}
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, textAlign: 'center' }}>Nota</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, textAlign: 'center' }}>Estado</TableCell>
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
                      <Typography sx={{ 
                        fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}>
                        {activity.name}
                      </Typography>
                      {isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography sx={{ fontSize: 10, color: '#888' }}>
                            {activity.percentage}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 10, color: '#AAA' }} />
                            <Typography sx={{ fontSize: 10, color: '#666' }}>
                              {activity.date ? new Date(activity.date).toLocaleDateString('es-CO') : '—'}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: '#888' }}>
                            {activity.percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 11, color: '#AAA' }} />
                            <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: '#666' }}>
                              {activity.date ? new Date(activity.date).toLocaleDateString('es-CO') : '—'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </>
                    )}
                    <TableCell align="center">
                      {isGraded ? (
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: { xs: 1, sm: 1.25 },
                            py: { xs: 0.3, sm: 0.4 },
                            borderRadius: '20px',
                            background: activityStyle.bg,
                            color: activityStyle.color,
                            fontSize: { xs: 11, sm: 11.5, md: 12 },
                            fontWeight: 600
                          }}
                        >
                          {score}
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: '#AAA' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isGraded ? (
                        score >= minGrade ? (
                          <Chip
                            label="Aprobado"
                            size="small"
                            sx={{ 
                              backgroundColor: '#EAF3DE', 
                              color: '#27500A', 
                              height: { xs: 18, sm: 20 }, 
                              fontSize: { xs: 9, sm: 10 }
                            }}
                          />
                        ) : (
                          <Chip
                            label="Reprobado"
                            size="small"
                            sx={{ 
                              backgroundColor: '#FCEBEB', 
                              color: '#501313', 
                              height: { xs: 18, sm: 20 }, 
                              fontSize: { xs: 9, sm: 10 }
                            }}
                          />
                        )
                      ) : (
                        <Chip
                          label="Pendiente"
                          size="small"
                          sx={{ 
                            backgroundColor: '#F5F3EE', 
                            color: '#888', 
                            height: { xs: 18, sm: 20 }, 
                            fontSize: { xs: 9, sm: 10 }
                          }}
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

// ── Dashboard Principal Optimizado ─────────────────────────────────────────────────

const StudentDashboard = () => {
  const { user } = useAuth()
  const { settings, getMaxScore } = useSettings()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
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
      <Box sx={{ 
        fontFamily: '"DM Sans", sans-serif', 
        maxWidth: { xs: '100%', sm: '95%', md: 1000 },
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
            Panel del estudiante
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
            ¡Hola, {user?.first_name || user?.username}!
          </Typography>
        </Box>

        {/* ── Métricas principales optimizadas ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr' },
            gap: { xs: 1, sm: 1.2, md: 1.5 },
            mb: { xs: 2.5, sm: 3 },
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

        {/* ── Resumen de asistencia optimizado ── */}
        {total > 0 && (
          <Box
            sx={{
              p: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' },
              borderRadius: '14px',
              border: '0.5px solid',
              borderColor: 'divider',
              background: '#fff',
              mb: { xs: 2.5, sm: 3 },
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 0 },
              mb: 1.5 
            }}>
              <Typography sx={{ 
                fontSize: { xs: 12, sm: 12.5, md: 13 }, 
                fontWeight: 500, 
                color: '#1A1A2E' 
              }}>
                Resumen de asistencia
              </Typography>
              <Box
                onClick={() => navigate('/attendance')}
                sx={{ 
                  fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                  color: '#6C63FF', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5 
                }}
              >
                Ver historial <ArrowForwardOutlined sx={{ fontSize: { xs: 11, sm: 12 } }} />
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 1.5 },
              mb: 1.5, 
              flexWrap: 'wrap' 
            }}>
              {[
                { label: 'Presentes', value: present, color: '#27500A', bg: '#EAF3DE', icon: <CheckCircleOutlined sx={{ fontSize: { xs: 12, sm: 13, md: 14 } }} /> },
                { label: 'Tardanzas', value: late, color: '#633806', bg: '#FAEEDA', icon: <AccessTimeOutlined sx={{ fontSize: { xs: 12, sm: 13, md: 14 } }} /> },
                { label: 'Ausencias', value: absent, color: '#501313', bg: '#FCEBEB', icon: <CancelOutlined sx={{ fontSize: { xs: 12, sm: 13, md: 14 } }} /> },
              ].map(s => (
                <Box
                  key={s.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.75, sm: 1 },
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.6, sm: 0.75 },
                    borderRadius: '8px',
                    background: s.bg,
                    color: s.color,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-start' }
                  }}
                >
                  {s.icon}
                  <Typography sx={{ 
                    fontSize: { xs: 12, sm: 12.5, md: 13 }, 
                    fontWeight: 500, 
                    color: s.color 
                  }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: { xs: 10, sm: 11 }, 
                    color: s.color, 
                    opacity: 0.75 
                  }}>
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, height: 5, background: '#F0EDE8', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ width: `${attPct}%`, height: '100%', background: attStyle.bar, borderRadius: 3 }} />
              </Box>
              <Typography sx={{ 
                fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                fontWeight: 500, 
                color: attStyle.color, 
                minWidth: 34 
              }}>
                {attPct}%
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Sección de calificaciones optimizada ── */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 2.5 },
            borderRadius: '14px',
            border: '0.5px solid',
            borderColor: 'divider',
            background: '#FAFAF8',
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
              Mis calificaciones
            </Typography>
            <Box
              onClick={() => navigate('/grades')}
              sx={{ 
                fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                color: '#6C63FF', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5 
              }}
            >
              Ver detalle completo <ArrowForwardOutlined sx={{ fontSize: { xs: 11, sm: 12 } }} />
            </Box>
          </Box>
          
          {subjects.length === 0 ? (
            <Box py={{ xs: 3, sm: 4 }} textAlign="center">
              <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#AAA' }}>
                No hay calificaciones registradas aún
              </Typography>
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