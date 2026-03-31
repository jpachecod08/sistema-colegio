import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Alert, LinearProgress, useMediaQuery, useTheme } from '@mui/material'
import {
  PersonOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  AccessTimeOutlined,
  WarningAmberOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const getScoreStyle = (score) => {
  if (score >= 70) return { color: '#27500A', bg: '#EAF3DE', bar: '#639922', border: '#639922' }
  if (score >= 50) return { color: '#633806', bg: '#FAEEDA', bar: '#BA7517', border: '#BA7517' }
  return { color: '#501313', bg: '#FCEBEB', bar: '#A32D2D', border: '#A32D2D' }
}

// ── Sub-componentes optimizados ───────────────────────────────────────────

const BigMetric = ({ label, value, note, accent }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Box
      sx={{
        p: { xs: '16px 18px', sm: '18px 20px', md: '22px 24px' },
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
          fontSize: { xs: 32, sm: 40, md: 48 },
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

const SubjectRow = ({ grade, index }) => {
  const score = grade.score || 0
  const { color, bg, bar, border } = getScoreStyle(score)
  const approved = score >= 60
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr auto' : '1fr auto 120px auto',
        gap: { xs: 1.5, sm: 2 },
        py: { xs: 1.2, sm: 1.5 },
        borderBottom: '0.5px solid #F5F3EE',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography sx={{ 
        fontSize: { xs: 12, sm: 12.5, md: 13 }, 
        color: '#1A1A2E', 
        fontWeight: 450,
        wordBreak: 'break-word'
      }}>
        {grade.subject_name || grade.subject}
      </Typography>
      <Typography sx={{ 
        fontSize: { xs: 13, sm: 13.5, md: 14 }, 
        fontWeight: 600, 
        color, 
        minWidth: { xs: 28, sm: 32 },
        textAlign: 'right' 
      }}>
        {score}
      </Typography>
      {!isMobile && (
        <>
          <Box sx={{ height: 5, background: '#F0EDE8', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ width: `${Math.min(score, 100)}%`, height: '100%', background: bar, borderRadius: 3 }} />
          </Box>
          <Box
            sx={{
              px: 1.25,
              py: 0.4,
              borderRadius: '20px',
              background: bg,
              color,
              fontSize: 11,
              fontWeight: 500,
              border: `0.5px solid ${border}`,
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {approved ? '✓ Aprobado' : '✗ Reprobado'}
          </Box>
        </>
      )}
      {isMobile && (
        <Box sx={{ gridColumn: 'span 2', mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ flex: 1, height: 4, background: '#F0EDE8', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min(score, 100)}%`, height: '100%', background: bar, borderRadius: 3 }} />
            </Box>
            <Box
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: '20px',
                background: bg,
                color,
                fontSize: 10,
                fontWeight: 500,
                border: `0.5px solid ${border}`,
                whiteSpace: 'nowrap',
              }}
            >
              {approved ? '✓ Aprobado' : '✗ Reprobado'}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ── Dashboard optimizado ─────────────────────────────────────────────────

const ParentDashboard = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  const [loading, setLoading] = useState(true)
  const [childLoading, setChildLoading] = useState(false)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [grades, setGrades] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get('/users/my-children/')
        const d = Array.isArray(r.data) ? r.data : (r.data?.results || [])
        setChildren(d)
        if (d.length > 0) setSelectedChild(d[0])
      } catch {
        setError('No tienes estudiantes vinculados. Contacta al colegio.')
      } finally { setLoading(false) }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (!selectedChild) return
    const fetch = async () => {
      setChildLoading(true)
      setGrades([])
      setAttendanceRecords([])
      try {
        try {
          const r = await api.get(`/grades/student/${selectedChild.id}/`)
          setGrades(Array.isArray(r.data) ? r.data : (r.data?.results || []))
        } catch {}
        try {
          const r = await api.get(`/attendance/student/${selectedChild.id}/`)
          setAttendanceRecords(Array.isArray(r.data) ? r.data : (r.data?.results || []))
        } catch {}
      } finally { setChildLoading(false) }
    }
    fetch()
  }, [selectedChild])

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
      <CircularProgress size={28} />
    </Box>
  )

  // ── Cálculos ──
  const avg = grades.length > 0
    ? Math.round(grades.reduce((s, g) => s + (g.score || 0), 0) / grades.length)
    : null
  const avgStyle = avg !== null ? getScoreStyle(avg) : {}

  const total = attendanceRecords.length
  const present = attendanceRecords.filter(r => r.status === 'present').length
  const late = attendanceRecords.filter(r => r.status === 'late').length
  const absent = attendanceRecords.filter(r => r.status === 'absent').length
  const attPct = total > 0 ? Math.round(((present + late) / total) * 100) : null
  const attStyle = attPct !== null ? getScoreStyle(attPct) : {}

  const riskSubjects = grades.filter(g => (g.score || 0) < 60)

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
            Seguimiento familiar
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
          <Typography sx={{ 
            fontSize: { xs: 12, sm: 12.5, md: 13 }, 
            color: '#AAA', 
            mt: 0.5 
          }}>
            Monitorea el rendimiento académico de tus hijos
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: '10px',
              fontSize: { xs: 12, sm: 13 },
              background: '#FFFBEB',
              border: '0.5px solid #FDE68A',
              color: '#92400E',
              '& .MuiAlert-icon': {
                fontSize: { xs: 18, sm: 20 }
              }
            }}
          >
            {error}
          </Alert>
        )}

        {children.length === 0 ? (
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              borderRadius: '14px',
              border: '0.5px dashed',
              borderColor: 'divider',
              background: '#FAFAF8',
            }}
          >
            <PersonOutlined sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#DDD', mb: 2 }} />
            <Typography sx={{ 
              fontSize: { xs: 14, sm: 14.5, md: 15 }, 
              color: '#888' 
            }}>
              No tienes estudiantes vinculados
            </Typography>
            <Typography sx={{ 
              fontSize: { xs: 12, sm: 12.5, md: 13 }, 
              color: '#AAA', 
              mt: 0.5 
            }}>
              Comunícate con la institución para vincular a tu hijo/a
            </Typography>
          </Box>
        ) : (
          <>
            {/* ── Selector de hijo optimizado ── */}
            {children.length > 1 && (
              <Box sx={{ mb: 3 }}>
                <FormControl size="small" sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: '100%', sm: 260 }
                }}>
                  <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    Seleccionar estudiante
                  </InputLabel>
                  <Select
                    value={selectedChild?.id || ''}
                    onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value))}
                    label="Seleccionar estudiante"
                    sx={{ fontSize: { xs: 12, sm: 13 } }}
                  >
                    {children.map(c => (
                      <MenuItem key={c.id} value={c.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                        {c.student_name || c.full_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* ── Chip del estudiante activo optimizado ── */}
            {selectedChild && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: { xs: 1.5, sm: 1.75 },
                  py: { xs: 0.6, sm: 0.75 },
                  borderRadius: '20px',
                  background: '#F0EDFF',
                  border: '0.5px solid #C4B5FD',
                  mb: { xs: 2.5, sm: 3 },
                  width: 'auto',
                }}
              >
                <PersonOutlined sx={{ fontSize: { xs: 12, sm: 13, md: 14 }, color: '#6C63FF' }} />
                <Typography sx={{ 
                  fontSize: { xs: 12, sm: 12.5, md: 13 }, 
                  fontWeight: 500, 
                  color: '#4C1D95',
                  wordBreak: 'break-word'
                }}>
                  {selectedChild.student_name || selectedChild.full_name}
                </Typography>
              </Box>
            )}

            {childLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {/* ── Alerta materias en riesgo optimizada ── */}
                {riskSubjects.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 1.5 },
                      p: { xs: '10px 14px', sm: '12px 16px' },
                      borderRadius: '10px',
                      background: '#FCEBEB',
                      border: '0.5px solid #A32D2D',
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <WarningAmberOutlined sx={{ fontSize: { xs: 16, sm: 18 }, color: '#A32D2D', flexShrink: 0 }} />
                      <Typography sx={{ 
                        fontSize: { xs: 12, sm: 13 }, 
                        fontWeight: 500, 
                        color: '#501313' 
                      }}>
                        {riskSubjects.length} materia{riskSubjects.length > 1 ? 's' : ''} con riesgo de reprobación
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      fontSize: { xs: 11, sm: 12 }, 
                      color: '#7F1D1D',
                      pl: { xs: 0, sm: 1 }
                    }}>
                      {riskSubjects.map(s => s.subject_name || s.subject).join(', ')}
                    </Typography>
                  </Box>
                )}

                {/* ── Métricas principales optimizadas ── */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: { xs: 1, sm: 1.2, md: 1.5 },
                    mb: { xs: 2.5, sm: 3 },
                  }}
                >
                  <BigMetric
                    label="Promedio general"
                    value={avg !== null ? avg : '—'}
                    accent={avg !== null ? avgStyle.color : '#AAA'}
                    note={avg !== null
                      ? `${grades.filter(g => (g.score || 0) >= 60).length} aprobadas / ${riskSubjects.length} en riesgo`
                      : 'Sin calificaciones registradas'}
                  />
                  <BigMetric
                    label="Asistencia"
                    value={attPct !== null ? `${attPct}%` : '—'}
                    accent={attPct !== null ? attStyle.color : '#AAA'}
                    note={total > 0 ? `${absent} ausencia${absent !== 1 ? 's' : ''} · ${late} tardanza${late !== 1 ? 's' : ''}` : 'Sin registros'}
                  />
                </Box>

                {/* ── Barra detalle asistencia optimizada ── */}
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
                        Detalle de asistencia
                      </Typography>
                      <Typography sx={{ fontSize: { xs: 10, sm: 11, md: 12 }, color: '#AAA' }}>
                        {total} clases registradas
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 1.5 },
                      mb: 1.5,
                      flexWrap: 'wrap' 
                    }}>
                      {[
                        { label: 'Presentes', value: present, color: '#27500A', bg: '#EAF3DE', icon: <CheckCircleOutlined sx={{ fontSize: { xs: 11, sm: 12, md: 13 } }} /> },
                        { label: 'Tardanzas', value: late, color: '#633806', bg: '#FAEEDA', icon: <AccessTimeOutlined sx={{ fontSize: { xs: 11, sm: 12, md: 13 } }} /> },
                        { label: 'Ausencias', value: absent, color: '#501313', bg: '#FCEBEB', icon: <CancelOutlined sx={{ fontSize: { xs: 11, sm: 12, md: 13 } }} /> },
                      ].map(s => (
                        <Box 
                          key={s.label} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75, 
                            px: { xs: 1, sm: 1.25 }, 
                            py: { xs: 0.5, sm: 0.6 }, 
                            borderRadius: '8px', 
                            background: s.bg, 
                            color: s.color,
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'space-between', sm: 'flex-start' }
                          }}
                        >
                          {s.icon}
                          <Typography sx={{ 
                            fontSize: { xs: 11, sm: 11.5, md: 12 }, 
                            fontWeight: 500, 
                            color: s.color 
                          }}>
                            {s.value} {s.label}
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
                        fontWeight: 600, 
                        color: attStyle.color, 
                        minWidth: 34 
                      }}>
                        {attPct}%
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* ── Tabla de materias optimizada ── */}
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    borderRadius: '14px',
                    border: '0.5px solid',
                    borderColor: 'divider',
                    background: '#FAFAF8',
                  }}
                >
                  <Typography sx={{ 
                    fontSize: { xs: 12, sm: 12.5, md: 13 }, 
                    fontWeight: 500, 
                    color: '#1A1A2E', 
                    mb: 2 
                  }}>
                    Calificaciones por materia
                  </Typography>
                  {grades.length === 0 ? (
                    <Box py={{ xs: 3, sm: 4 }} textAlign="center">
                      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#AAA' }}>
                        No hay calificaciones registradas aún
                      </Typography>
                    </Box>
                  ) : (
                    grades.map((g, i) => <SubjectRow key={i} grade={g} index={i} />)
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </>
  )
}

export default ParentDashboard