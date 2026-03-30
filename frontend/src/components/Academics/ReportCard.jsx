import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  PrintOutlined,
  FileDownloadOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  SchoolOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
  BadgeOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getScoreColors = (score) => {
  if (score >= 70) return { color: '#27500A', bg: '#EAF3DE', bar: '#639922', border: '#639922' }
  if (score >= 50) return { color: '#633806', bg: '#FAEEDA', bar: '#BA7517', border: '#BA7517' }
  return { color: '#501313', bg: '#FCEBEB', bar: '#A32D2D', border: '#A32D2D' }
}

const ScoreCircle = ({ score, size = 56 }) => {
  const cfg = getScoreColors(score)
  const r = (size / 2) - 5
  const circ = 2 * Math.PI * r
  const progress = Math.min(score / 100, 1)
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="3.5" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={cfg.bar} strokeWidth="3.5"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <Typography
        sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size > 50 ? 13 : 11, fontWeight: 600,
          color: cfg.color,
        }}
      >
        {score}
      </Typography>
    </Box>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
      {React.cloneElement(icon, { sx: { fontSize: 15 } })}
    </Box>
    <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 80 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 450 }}>{value || '—'}</Typography>
  </Box>
)

// ─── Componente de materia ────────────────────────────────────────────────────
const SubjectCard = ({ subject, index }) => {
  const [expanded, setExpanded] = useState(false)
  const cfg = getScoreColors(subject.final_score)
  const approved = subject.final_score >= 60

  return (
    <Box
      sx={{
        border: '0.5px solid',
        borderColor: expanded ? cfg.border : 'divider',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        '@media print': { borderColor: 'divider !important', pageBreakInside: 'avoid' },
      }}
    >
      {/* Cabecera de materia */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2.5,
          py: 1.75,
          cursor: 'pointer',
          transition: 'background 0.12s',
          '&:hover': { background: 'action.hover' },
          '@media print': { cursor: 'default' },
        }}
      >
        {/* Número de materia */}
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 500,
            color: 'text.secondary',
            minWidth: 20,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </Typography>

        {/* Nombre */}
        <Typography sx={{ fontSize: 14, fontWeight: 500, flex: 1 }}>
          {subject.name}
        </Typography>

        {/* Barra de progreso */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 200,
            display: { xs: 'none', sm: 'block' },
            '@media print': { display: 'block' },
          }}
        >
          <LinearProgress
            variant="determinate"
            value={Math.min(subject.final_score, 100)}
            sx={{
              height: 5,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.07)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: cfg.bar,
              },
            }}
          />
        </Box>

        {/* Nota final */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              px: 1.5, py: 0.5,
              borderRadius: '20px',
              background: cfg.bg,
              color: cfg.color,
              fontSize: 13,
              fontWeight: 600,
              border: `0.5px solid ${cfg.border}`,
            }}
          >
            {subject.final_score}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: '20px',
              fontSize: 11,
              fontWeight: 500,
              background: approved ? '#EAF3DE' : '#FCEBEB',
              color: approved ? '#27500A' : '#501313',
            }}
          >
            {approved
              ? <CheckCircleOutlined sx={{ fontSize: 12 }} />
              : <CancelOutlined sx={{ fontSize: 12 }} />}
            {approved ? 'Aprobado' : 'Reprobado'}
          </Box>

          {/* Indicador expandir */}
          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
              display: { xs: 'none', sm: 'block' },
              '@media print': { display: 'none' },
            }}
          >
            ▾
          </Typography>
        </Box>
      </Box>

      {/* Detalle de actividades */}
      {(expanded || true) && subject.activities?.length > 0 && (
        <Box
          sx={{
            borderTop: '0.5px solid',
            borderColor: 'divider',
            px: 2.5,
            py: 2,
            background: 'background.default',
            display: expanded ? 'block' : 'none',
            '@media print': { display: 'block !important' },
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Actividades del periodo
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(200px, 1fr))' },
              gap: 1,
            }}
          >
            {subject.activities.map((activity, i) => {
              const actCfg = getScoreColors(activity.score)
              return (
                <Box
                  key={i}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '8px',
                    border: '0.5px solid',
                    borderColor: 'divider',
                    background: 'background.paper',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {activity.percentage}% del periodo
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      borderRadius: '20px',
                      background: actCfg.bg,
                      color: actCfg.color,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `0.5px solid ${actCfg.border}`,
                      flexShrink: 0,
                    }}
                  >
                    {activity.score ?? '—'}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
const ReportCard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState('')
  const [periods, setPeriods] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const printRef = useRef()

  useEffect(() => {
    fetchReportCard()
  }, [selectedPeriod])

  const fetchReportCard = async () => {
    setLoading(true)
    try {
      const url = selectedPeriod
        ? `/grades/report-card/?period=${selectedPeriod}`
        : '/grades/report-card/'
      const res = await api.get(url)
      setReportData(res.data)

      // Extraer periodos disponibles si vienen en la respuesta
      if (res.data?.available_periods && periods.length === 0) {
        setPeriods(res.data.available_periods)
        if (!selectedPeriod && res.data.available_periods.length > 0) {
          setSelectedPeriod(res.data.available_periods[0].id)
        }
      }
    } catch {
      setError('Error al cargar el boletín')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const handleDownload = async () => {
    try {
      const res = await api.get('/grades/report-card/pdf/', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `boletin_${reportData?.student_name?.replace(/ /g, '_')}_${reportData?.period_name || 'periodo'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Error al descargar el boletín')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !reportData) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
  }

  // ── Cálculos resumen ──
  const subjects = reportData?.subjects || []
  const approvedCount = subjects.filter((s) => s.final_score >= 60).length
  const failedCount = subjects.length - approvedCount
  const generalAvg =
    subjects.length > 0
      ? Math.round(subjects.reduce((s, sub) => s + (sub.final_score || 0), 0) / subjects.length)
      : 0
  const avgCfg = getScoreColors(generalAvg)
  const attendance = reportData?.attendance || {}

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* ── Barra de acciones (no se imprime) ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
          '@media print': { display: 'none' },
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={500} sx={{ mb: 0.25 }}>
            Boletín académico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {reportData?.period_name || 'Periodo académico'} · {reportData?.academic_year || ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Selector de periodo */}
          {periods.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: 13 }}>Periodo</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                label="Periodo"
                sx={{ fontSize: 13 }}
              >
                {periods.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontSize: 13 }}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box
            component="button"
            onClick={handlePrint}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 1, borderRadius: '8px',
              border: '0.5px solid', borderColor: 'divider',
              background: 'background.paper', color: 'text.primary',
              fontSize: 13, cursor: 'pointer',
              '&:hover': { background: 'action.hover' },
            }}
          >
            <PrintOutlined sx={{ fontSize: 16 }} />
            Imprimir
          </Box>

          <Box
            component="button"
            onClick={handleDownload}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.75, py: 1, borderRadius: '8px',
              border: 'none', bgcolor: 'text.primary', color: 'background.paper',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              '&:hover': { opacity: 0.88 },
            }}
          >
            <FileDownloadOutlined sx={{ fontSize: 16 }} />
            Descargar PDF
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Documento boletín ── */}
      <Box
        ref={printRef}
        id="report-card"
        sx={{
          border: '0.5px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          overflow: 'hidden',
          '@media print': {
            border: 'none',
            borderRadius: 0,
          },
        }}
      >
        {/* ── Encabezado institucional ── */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 3,
            background: 'background.default',
            borderBottom: '0.5px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 3,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            {/* Logo / nombre institución */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  background: 'background.paper',
                  border: '0.5px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <SchoolOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                  {reportData?.school_name || 'Institución Educativa'}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {reportData?.school_address || ''} {reportData?.school_email ? `· ${reportData.school_email}` : ''}
                </Typography>
              </Box>
            </Box>

            {/* Título del documento */}
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Boletín de calificaciones
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                {reportData?.academic_year} · {reportData?.period_name}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Info del estudiante + resumen ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            borderBottom: '0.5px solid',
            borderColor: 'divider',
          }}
        >
          {/* Datos personales */}
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3, borderRight: { md: '0.5px solid' }, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Información del estudiante
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InfoRow icon={<PersonOutlined />} label="Nombre" value={reportData?.student_name} />
              <InfoRow icon={<BadgeOutlined />} label="Documento" value={reportData?.student_document} />
              <InfoRow icon={<SchoolOutlined />} label="Grado" value={reportData?.grade} />
              <InfoRow
                icon={<CalendarTodayOutlined />}
                label="Fecha"
                value={new Date().toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </Box>
          </Box>

          {/* Resumen académico */}
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resumen del periodo
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
              }}
            >
              {/* Promedio general */}
              <Box
                sx={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '10px',
                  background: avgCfg.bg,
                  border: `0.5px solid ${avgCfg.border}`,
                }}
              >
                <ScoreCircle score={generalAvg} size={52} />
                <Box>
                  <Typography sx={{ fontSize: 11, color: avgCfg.color, opacity: 0.8 }}>
                    Promedio general del periodo
                  </Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 600, color: avgCfg.color, lineHeight: 1.2 }}>
                    {generalAvg} / 100
                  </Typography>
                </Box>
              </Box>

              {/* Aprobadas */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  background: '#EAF3DE',
                  border: '0.5px solid #639922',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                }}
              >
                <Typography sx={{ fontSize: 10, color: '#27500A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Aprobadas
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#27500A' }}>
                    {approvedCount}
                  </Typography>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#639922' }} />
                </Box>
              </Box>

              {/* Reprobadas */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  background: failedCount > 0 ? '#FCEBEB' : 'background.default',
                  border: `0.5px solid ${failedCount > 0 ? '#A32D2D' : 'divider'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    color: failedCount > 0 ? '#501313' : 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Reprobadas
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: failedCount > 0 ? '#501313' : 'text.secondary',
                    }}
                  >
                    {failedCount}
                  </Typography>
                  {failedCount > 0 && (
                    <CancelOutlined sx={{ fontSize: 16, color: '#A32D2D' }} />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Calificaciones por materia ── */}
        <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              color: 'text.secondary',
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Calificaciones por asignatura
          </Typography>

          {subjects.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: 'center',
                border: '0.5px solid',
                borderColor: 'divider',
                borderRadius: '10px',
                background: 'background.default',
              }}
            >
              <Typography color="text.secondary" fontSize={14}>
                No hay calificaciones registradas en este periodo
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {subjects.map((subject, i) => (
                <SubjectCard key={i} subject={subject} index={i} />
              ))}
            </Box>
          )}
        </Box>

        <Divider />

        {/* ── Asistencia ── */}
        <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              color: 'text.secondary',
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Resumen de asistencia
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 1.25,
            }}
          >
            {[
              { label: 'Días hábiles', value: attendance.total_days || 0, color: null },
              { label: 'Asistencias', value: attendance.present || 0, color: '#27500A', bg: '#EAF3DE', border: '#639922' },
              { label: 'Tardanzas', value: attendance.late || 0, color: '#633806', bg: '#FAEEDA', border: '#BA7517' },
              { label: 'Ausencias', value: attendance.absent || 0, color: '#501313', bg: '#FCEBEB', border: '#A32D2D' },
            ].map(({ label, value, color, bg, border }) => (
              <Box
                key={label}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  background: bg || 'background.default',
                  border: `0.5px solid ${border || 'divider'}`,
                }}
              >
                <Typography sx={{ fontSize: 11, color: color || 'text.secondary', mb: 0.5 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 26, fontWeight: 600, color: color || 'text.primary', lineHeight: 1 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Barra de asistencia */}
          {attendance.total_days > 0 && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                Tasa de asistencia
              </Typography>
              <LinearProgress
                variant="determinate"
                value={attendance.percentage || 0}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.07)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor:
                      (attendance.percentage || 0) >= 80
                        ? '#639922'
                        : (attendance.percentage || 0) >= 60
                        ? '#BA7517'
                        : '#A32D2D',
                  },
                }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
                {attendance.percentage || 0}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Observaciones ── */}
        {reportData?.observations && (
          <>
            <Divider />
            <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'text.secondary',
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Observaciones del periodo
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  background: 'background.default',
                  border: '0.5px solid',
                  borderColor: 'divider',
                  borderLeft: '3px solid',
                  borderLeftColor: 'text.secondary',
                }}
              >
                <Typography sx={{ fontSize: 13, lineHeight: 1.7 }}>
                  {reportData.observations}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {/* ── Pie de página ── */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 2,
            background: 'background.default',
            borderTop: '0.5px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Documento oficial — {reportData?.school_name || 'Institución Educativa'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Generado el{' '}
            {new Date().toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>

      {/* ── Estilos de impresión ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-card, #report-card * { visibility: visible; }
          #report-card {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            border: none !important;
            border-radius: 0 !important;
          }
          .MuiButton-root { display: none !important; }
        }
      `}</style>
    </Box>
  )
}

export default ReportCard
