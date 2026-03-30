import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Menu,
  Divider,
  LinearProgress
} from '@mui/material'
import {
  CheckCircleOutlined,
  CancelOutlined,
  AccessTimeOutlined,
  SaveOutlined,
  RefreshOutlined,
  FileDownloadOutlined,
  DoneAllOutlined,
  RemoveCircleOutlineOutlined,
  MoreVert
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// ─── Paleta y estilos base ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  present: {
    label: 'Presente',
    color: '#27500A',
    bg: '#EAF3DE',
    border: '#639922',
    icon: <CheckCircleOutlined sx={{ fontSize: 15 }} />,
  },
  late: {
    label: 'Tarde',
    color: '#633806',
    bg: '#FAEEDA',
    border: '#BA7517',
    icon: <AccessTimeOutlined sx={{ fontSize: 15 }} />,
  },
  absent: {
    label: 'Ausente',
    color: '#501313',
    bg: '#FCEBEB',
    border: '#A32D2D',
    icon: <CancelOutlined sx={{ fontSize: 15 }} />,
  },
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const Avatar = ({ name }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Color determinista según nombre
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(1 || 0) * 13) % 360
  const bg = `hsl(${hue},42%,88%)`
  const fg = `hsl(${hue},42%,28%)`

  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </Box>
  )
}

const StatusBadge = ({ status }) => {
  if (!status) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.25,
          py: 0.5,
          borderRadius: '20px',
          fontSize: 11,
          fontWeight: 500,
          background: 'rgba(0,0,0,0.05)',
          color: 'text.secondary',
        }}
      >
        —
      </Box>
    )
  }
  const cfg = STATUS_CONFIG[status]
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: '20px',
        fontSize: 11,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.color,
        border: `0.5px solid ${cfg.border}`,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  )
}

const AttendanceButton = ({ type, active, onClick }) => {
  const cfg = STATUS_CONFIG[type]
  const icons = {
    present: <CheckCircleOutlined sx={{ fontSize: 16 }} />,
    late: <AccessTimeOutlined sx={{ fontSize: 16 }} />,
    absent: <CancelOutlined sx={{ fontSize: 16 }} />,
  }
  return (
    <Tooltip title={cfg.label} placement="top" arrow>
      <Box
        component="button"
        onClick={onClick}
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          border: active ? `0.5px solid ${cfg.border}` : '0.5px solid',
          borderColor: active ? cfg.border : 'divider',
          background: active ? cfg.bg : 'background.paper',
          color: active ? cfg.color : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.12s ease',
          '&:hover': {
            background: cfg.bg,
            color: cfg.color,
            borderColor: cfg.border,
            transform: 'scale(1.08)',
          },
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        {icons[type]}
      </Box>
    </Tooltip>
  )
}

const StatCard = ({ label, value, dotColor }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.75,
      py: 1.25,
      borderRadius: '10px',
      background: 'background.default',
      border: '0.5px solid',
      borderColor: 'divider',
      minWidth: 90,
    }}
  >
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: dotColor,
        flexShrink: 0,
      }}
    />
    <Box>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

// ─── Vista de profesor ────────────────────────────────────────────────────────
const TeacherView = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [selectedClass, setSelectedClass] = useState('')
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const [menuAnchor, setMenuAnchor] = useState(null)

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity })

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) fetchStudentsForAttendance()
  }, [selectedClass, selectedDate])

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academics/my-assignments/')
      const data = res.data || []
      setClasses(data)
      if (data.length > 0) setSelectedClass(data[0].id)
    } catch {
      setError('Error al cargar las clases')
    }
  }

  const fetchStudentsForAttendance = async () => {
    setLoading(true)
    try {
      const res = await api.get(
        `/attendance/students/?teacher_assignment_id=${selectedClass}&date=${selectedDate}`
      )
      const studentsData = res.data.students || res.data.results || []
      setStudents(studentsData)
      const map = {}
      studentsData.forEach((s) => {
        if (s.status) map[s.student_id || s.id] = s.status
      })
      setAttendance(map)
    } catch {
      setError('Error al cargar los estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const handleMark = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }))
  }

  const handleMarkAll = (status) => {
    const map = {}
    students.forEach((s) => {
      map[s.student_id || s.id] = status
    })
    setAttendance(map)
    setMenuAnchor(null)
  }

  const handleSave = async () => {
    if (!selectedClass) return setError('Selecciona una clase')
    const unmarked = students.filter((s) => !attendance[s.student_id || s.id])
    if (unmarked.length > 0) {
      return showSnack(
        `Hay ${unmarked.length} estudiante${unmarked.length > 1 ? 's' : ''} sin marcar`,
        'warning'
      )
    }
    setSaving(true)
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        teacher_assignment_id: selectedClass,
        date: selectedDate,
        status,
      }))
      await api.post('/attendance/save/', {
        records,
        teacher_assignment_id: selectedClass,
      })
      showSnack('Asistencia guardada correctamente')
      setTimeout(() => fetchStudentsForAttendance(), 1500)
    } catch {
      showSnack('Error al guardar la asistencia', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    // Genera CSV básico para descarga
    const header = 'Estudiante,Estado,Fecha\n'
    const rows = students
      .map((s) => {
        const id = s.student_id || s.id
        const status = attendance[id] || 'sin marcar'
        return `"${s.student_name}","${status}","${selectedDate}"`
      })
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia_${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Stats ──
  const vals = Object.values(attendance)
  const total = students.length
  const presentCount = vals.filter((v) => v === 'present').length
  const lateCount = vals.filter((v) => v === 'late').length
  const absentCount = vals.filter((v) => v === 'absent').length
  const unmarkedCount = students.filter(
    (s) => !attendance[s.student_id || s.id]
  ).length
  const attPct =
    total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0

  const selectedClassInfo = classes.find((c) => c.id === selectedClass)

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* ── Encabezado ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={500} sx={{ mb: 0.25 }}>
            Toma de asistencia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedClassInfo
              ? `${selectedClassInfo.subject_name} — ${selectedClassInfo.grade_name}`
              : 'Selecciona una clase'}
            {' · '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Exportar CSV">
            <Box
              component="button"
              onClick={handleExport}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 1,
                borderRadius: '8px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: 'background.paper',
                color: 'text.primary',
                fontSize: 13,
                cursor: 'pointer',
                '&:hover': { background: 'action.hover' },
              }}
            >
              <FileDownloadOutlined sx={{ fontSize: 16 }} />
              Exportar
            </Box>
          </Tooltip>

          <Box
            component="button"
            onClick={handleSave}
            disabled={saving}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.75,
              py: 1,
              borderRadius: '8px',
              border: 'none',
              background: 'text.primary',
              bgcolor: 'text.primary',
              color: 'background.paper',
              fontSize: 13,
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'opacity .15s',
              '&:hover': { opacity: 0.88 },
            }}
          >
            {saving ? (
              <CircularProgress size={14} sx={{ color: 'inherit' }} />
            ) : (
              <SaveOutlined sx={{ fontSize: 16 }} />
            )}
            {saving ? 'Guardando...' : 'Guardar'}
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ── Filtros ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr auto auto' },
          gap: 1.5,
          mb: 2.5,
          p: 2,
          borderRadius: '12px',
          border: '0.5px solid',
          borderColor: 'divider',
          background: 'background.default',
          alignItems: 'flex-end',
        }}
      >
        <FormControl size="small">
          <InputLabel sx={{ fontSize: 13 }}>Clase / Materia</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            label="Clase / Materia"
            sx={{ fontSize: 13 }}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id} sx={{ fontSize: 13 }}>
                {cls.subject_name} — {cls.grade_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          type="date"
          label="Fecha"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ style: { fontSize: 13 } }}
        />

        <Box
          component="button"
          onClick={fetchStudentsForAttendance}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 1,
            height: 40,
            borderRadius: '8px',
            border: '0.5px solid',
            borderColor: 'divider',
            background: 'background.paper',
            color: 'text.secondary',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': { background: 'action.hover', color: 'text.primary' },
          }}
        >
          <RefreshOutlined sx={{ fontSize: 16 }} />
          Actualizar
        </Box>

        <Box
          component="button"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 1,
            height: 40,
            borderRadius: '8px',
            border: '0.5px solid',
            borderColor: 'divider',
            background: 'background.paper',
            color: 'text.secondary',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': { background: 'action.hover', color: 'text.primary' },
          }}
        >
          <DoneAllOutlined sx={{ fontSize: 16 }} />
          Marcar todos
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleMarkAll('present')} sx={{ fontSize: 13, gap: 1 }}>
            <CheckCircleOutlined sx={{ fontSize: 16, color: '#639922' }} />
            Todos presentes
          </MenuItem>
          <MenuItem onClick={() => handleMarkAll('late')} sx={{ fontSize: 13, gap: 1 }}>
            <AccessTimeOutlined sx={{ fontSize: 16, color: '#BA7517' }} />
            Todos en tardanza
          </MenuItem>
          <MenuItem onClick={() => handleMarkAll('absent')} sx={{ fontSize: 13, gap: 1 }}>
            <CancelOutlined sx={{ fontSize: 16, color: '#A32D2D' }} />
            Todos ausentes
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAttendance({})
              setMenuAnchor(null)
            }}
            sx={{ fontSize: 13, gap: 1 }}
          >
            <RemoveCircleOutlineOutlined sx={{ fontSize: 16 }} />
            Limpiar todo
          </MenuItem>
        </Menu>
      </Box>

      {/* ── Stats ── */}
      {students.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <StatCard label="Presentes" value={presentCount} dotColor="#639922" />
          <StatCard label="Tardanzas" value={lateCount} dotColor="#BA7517" />
          <StatCard label="Ausentes" value={absentCount} dotColor="#A32D2D" />
          <StatCard
            label="Sin marcar"
            value={unmarkedCount}
            dotColor="rgba(0,0,0,0.2)"
          />
          {/* Barra de progreso */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              minWidth: 180,
              px: 1.75,
              py: 1.25,
              borderRadius: '10px',
              background: 'background.default',
              border: '0.5px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
              Asistencia
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={attPct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.07)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor:
                      attPct >= 80
                        ? '#639922'
                        : attPct >= 60
                        ? '#BA7517'
                        : '#A32D2D',
                  },
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, minWidth: 34, textAlign: 'right' }}>
              {attPct}%
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Tabla ── */}
      {loading && students.length === 0 ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box
          sx={{
            border: '0.5px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Encabezado tabla */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 140px 140px',
              px: 2,
              py: 1.25,
              background: 'background.default',
              borderBottom: '0.5px solid',
              borderColor: 'divider',
            }}
          >
            {['#', 'Estudiante', 'Estado', 'Marcar'].map((h, i) => (
              <Typography
                key={h}
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: i >= 2 ? 'center' : 'left',
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>

          {students.length === 0 ? (
            <Box py={6} textAlign="center">
              <Typography color="text.secondary" fontSize={14}>
                No hay estudiantes en esta clase
              </Typography>
            </Box>
          ) : (
            students.map((student, index) => {
              const id = student.student_id || student.id
              const status = attendance[id] || null
              const isLast = index === students.length - 1

              return (
                <Box
                  key={id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 140px 140px',
                    px: 2,
                    py: 1.25,
                    alignItems: 'center',
                    borderBottom: isLast ? 'none' : '0.5px solid',
                    borderColor: 'divider',
                    transition: 'background .1s',
                    '&:hover': { background: 'action.hover' },
                  }}
                >
                  {/* Número */}
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {index + 1}
                  </Typography>

                  {/* Nombre */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar name={student.student_name || 'Estudiante'} />
                    <Typography sx={{ fontSize: 13, fontWeight: 450 }}>
                      {student.student_name}
                    </Typography>
                  </Box>

                  {/* Estado badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <StatusBadge status={status} />
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
                    {['present', 'late', 'absent'].map((type) => (
                      <AttendanceButton
                        key={type}
                        type={type}
                        active={status === type}
                        onClick={() => handleMark(id, type)}
                      />
                    ))}
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      )}

      {/* ── Barra inferior ── */}
      {students.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            px: 2,
            py: 1.5,
            borderRadius: '10px',
            border: '0.5px solid',
            borderColor: 'divider',
            background: 'background.default',
          }}
        >
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {unmarkedCount > 0
              ? `${unmarkedCount} estudiante${unmarkedCount > 1 ? 's' : ''} sin marcar`
              : '✓ Todos los estudiantes han sido marcados'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              component="button"
              onClick={() => handleMarkAll('present')}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '7px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: 'background.paper',
                fontSize: 12,
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { background: 'action.hover' },
              }}
            >
              Todos presentes
            </Box>
            <Box
              component="button"
              onClick={() => handleMarkAll('absent')}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '7px',
                border: '0.5px solid',
                borderColor: 'divider',
                background: 'background.paper',
                fontSize: 12,
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { background: 'action.hover' },
              }}
            >
              Todos ausentes
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ fontSize: 13 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ─── Vista de estudiante ──────────────────────────────────────────────────────
const StudentView = () => {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/attendance/my-attendance/')
        setRecords(res.data || [])
      } catch {
        setError('Error al cargar tu asistencia')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const presentCount = records.filter((r) => r.status === 'present').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const total = records.length
  const attPct =
    total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={500} sx={{ mb: 0.5 }}>
        Mi asistencia
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Historial de asistencia por clase
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats resumen */}
      {records.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <StatCard label="Presentes" value={presentCount} dotColor="#639922" />
          <StatCard label="Tardanzas" value={lateCount} dotColor="#BA7517" />
          <StatCard label="Ausencias" value={absentCount} dotColor="#A32D2D" />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              minWidth: 160,
              px: 1.75,
              py: 1.25,
              borderRadius: '10px',
              background: 'background.default',
              border: '0.5px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
              Total
            </Typography>
            <LinearProgress
              variant="determinate"
              value={attPct}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.07)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor:
                    attPct >= 80 ? '#639922' : attPct >= 60 ? '#BA7517' : '#A32D2D',
                },
              }}
            />
            <Typography sx={{ fontSize: 13, fontWeight: 500, minWidth: 34, textAlign: 'right' }}>
              {attPct}%
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tabla */}
      <Box
        sx={{
          border: '0.5px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 100px',
            px: 2,
            py: 1.25,
            background: 'background.default',
            borderBottom: '0.5px solid',
            borderColor: 'divider',
          }}
        >
          {['Fecha', 'Clase / Materia', 'Estado'].map((h) => (
            <Typography
              key={h}
              sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {records.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography color="text.secondary" fontSize={14}>
              No hay registros de asistencia aún
            </Typography>
          </Box>
        ) : (
          records.map((record, i) => (
            <Box
              key={record.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 100px',
                px: 2,
                py: 1.25,
                alignItems: 'center',
                borderBottom: i === records.length - 1 ? 'none' : '0.5px solid',
                borderColor: 'divider',
                '&:hover': { background: 'action.hover' },
              }}
            >
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {new Date(record.date + 'T12:00:00').toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                {record.subject_name || record.teacher_assignment}
              </Typography>
              <StatusBadge status={record.status} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
const Attendance = () => {
  const { user } = useAuth()

  if (user?.role === 'student') return <StudentView />
  return <TeacherView />
}

export default Attendance
