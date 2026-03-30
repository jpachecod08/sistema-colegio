import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, CircularProgress, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import {
  AddOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  RemoveOutlined,
  FileDownloadOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import api from '../../services/api'

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

// ── Helpers ───────────────────────────────────────────────────────────────────
const getScoreStyle = (score, minGrade, maxScore) => {
  if (score === null || score === undefined || score === '') return null
  const n = parseFloat(score)
  const threshold = minGrade || 60
  if (n >= threshold + 10) return { color: '#27500A', bg: '#EAF3DE', border: '#639922' }
  if (n >= threshold) return { color: '#633806', bg: '#FAEEDA', border: '#BA7517' }
  return { color: '#501313', bg: '#FCEBEB', border: '#A32D2D' }
}

const ScoreBadge = ({ score, minGrade, maxScore }) => {
  const s = getScoreStyle(score, minGrade, maxScore)
  if (!s) return (
    <Box sx={{ px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 12, background: '#F5F3EE', color: '#AAA', border: '0.5px solid #E0DDD8' }}>
      —
    </Box>
  )
  return (
    <Box sx={{ px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }}>
      {parseFloat(score).toFixed(1)}
    </Box>
  )
}

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const getAvatarColor = (name = '') => {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 13) % 360
  return { bg: `hsl(${hue},42%,90%)`, fg: `hsl(${hue},42%,28%)` }
}

// ── Celda de nota editable ────────────────────────────────────────────────────
const ScoreCell = ({ value, onChange, onSave, editing, onStartEdit, onCancel, maxScore }) => {
  const inputRef = useRef()
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus() }, [editing])

  if (editing) return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
      <input
        ref={inputRef}
        type="number"
        min={0} max={maxScore} step={0.5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }}
        style={{
          width: 64,
          border: '1.5px solid #6C63FF',
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 13,
          textAlign: 'center',
          outline: 'none',
          fontFamily: '"DM Sans", sans-serif',
          color: '#1A1A2E',
          boxShadow: '0 0 0 3px rgba(108,99,255,0.1)',
        }}
      />
      <Box
        component="button"
        onClick={onSave}
        sx={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#EAF3DE', color: '#27500A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { background: '#C0DD97' } }}
      >
        <SaveOutlined sx={{ fontSize: 13 }} />
      </Box>
      <Box
        component="button"
        onClick={onCancel}
        sx={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#F5F3EE', color: '#AAA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { background: '#E0DDD8' } }}
      >
        <CloseOutlined sx={{ fontSize: 13 }} />
      </Box>
    </Box>
  )

  return (
    <Box
      onClick={onStartEdit}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', cursor: 'pointer', '&:hover .edit-icon': { opacity: 1 } }}
    >
      <ScoreBadge score={value} minGrade={60} maxScore={maxScore} />
      <EditOutlined className="edit-icon" sx={{ fontSize: 12, color: '#CCC', opacity: 0, transition: 'opacity .15s' }} />
    </Box>
  )
}

// ── Campo del formulario ──────────────────────────────────────────────────────
const FormField = ({ label, hint, required, children }) => (
  <Box>
    <Typography component="label" sx={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#444', mb: 0.75, letterSpacing: '0.02em' }}>
      {label}{required && <Box component="span" sx={{ color: '#EF4444', ml: 0.25 }}>*</Box>}
    </Typography>
    {children}
    {hint && <Typography sx={{ fontSize: 11, color: '#AAA', mt: 0.5 }}>{hint}</Typography>}
  </Box>
)

const StyledInput = ({ value, onChange, type = 'text', placeholder, min, max, step, name }) => {
  const [focused, setFocused] = useState(false)
  return (
    <Box sx={{ borderRadius: '10px', border: `1.5px solid ${focused ? '#6C63FF' : '#E0DDD8'}`, background: '#fff', boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.08)' : 'none', transition: 'all .15s' }}>
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        min={min} max={max} step={step}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', padding: '10px 13px', fontSize: 13, color: '#1A1A2E', fontFamily: '"DM Sans", sans-serif' }}
      />
    </Box>
  )
}

// ── Vista profesor ────────────────────────────────────────────────────────────
const TeacherView = () => {
  const { settings, getMaxScore } = useSettings()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [activities, setActivities] = useState([])
  const [grades, setGrades] = useState({})
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [newAct, setNewAct] = useState({ name: '', percentage: '', date: new Date().toISOString().split('T')[0], teacher_assignment_id: '' })
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })

  const toast = (msg, severity = 'success') => setSnack({ open: true, msg, severity })
  const minGrade = settings.min_grade || 60
  const maxScore = getMaxScore()

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (selectedAssignment && students.length > 0 && assignments.length > 0) {
      const assignment = assignments.find(a => a.id === parseInt(selectedAssignment))
      if (assignment) {
        const filtered = students.filter(s => {
          const studentGradeId = s.grade_id || s.grade
          return studentGradeId === assignment.grade_id
        })
        setFilteredStudents(filtered)
      } else {
        setFilteredStudents(students)
      }
    } else {
      setFilteredStudents(students)
    }
  }, [selectedAssignment, students, assignments])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [studRes, assRes, actRes, gradesRes] = await Promise.allSettled([
        api.get('/academics/my-students/'),
        api.get('/academics/my-assignments/'),
        api.get('/grades/my-activities/'),
        api.get('/grades/my-class-grades/'),
      ])

      let studentsData = []
      let assignmentsData = []

      if (studRes.status === 'fulfilled') {
        const d = studRes.value.data
        studentsData = Array.isArray(d) ? d : (d?.results || [])
        studentsData = studentsData.map(s => ({
          ...s,
          real_id: s.student,
          grade_id: s.grade || s.grade_id
        }))
        setStudents(studentsData)
      }
      
      if (assRes.status === 'fulfilled') {
        const d = assRes.value.data
        assignmentsData = Array.isArray(d) ? d : (d?.results || [])
        assignmentsData = assignmentsData.map(a => ({
          ...a,
          grade_id: a.grade || a.grade_id
        }))
        setAssignments(assignmentsData)
        if (assignmentsData.length > 0 && !selectedAssignment) {
          setSelectedAssignment(assignmentsData[0].id.toString())
        }
      }
      
      if (actRes.status === 'fulfilled') {
        const d = actRes.value.data
        setActivities(Array.isArray(d) ? d : (d?.results || []))
      }
      
      if (gradesRes.status === 'fulfilled') {
        const d = gradesRes.value.data
        const arr = Array.isArray(d) ? d : (d?.results || [])
        const map = {}
        arr.forEach(g => {
          if (!map[g.student]) map[g.student] = {}
          map[g.student][g.activity] = parseFloat(g.score)
        })
        setGrades(map)
      }
      
    } catch (error) {
      console.error('Error en loadAll:', error)
    } finally { 
      setLoading(false)
    }
  }

  const startEdit = (studentId, activityId) => {
    setEditing(`${studentId}-${activityId}`)
    setEditValue(grades[studentId]?.[activityId] ?? '')
  }

  const saveGrade = async (studentId, activityId) => {
    if (editValue === '') { setEditing(null); return }
    const score = parseFloat(editValue)
    if (isNaN(score) || score < 0 || score > maxScore) {
      toast(`La nota debe estar entre 0 y ${maxScore}`, 'error')
      return
    }
    try {
      await api.post('/grades/save/', { 
        student_id: studentId,
        activity_id: activityId, 
        score 
      })
      setGrades(p => ({ ...p, [studentId]: { ...p[studentId], [activityId]: score } }))
      setEditing(null)
      toast('Nota guardada')
    } catch (error) {
      toast('Error al guardar la nota', 'error')
    }
  }

  const calcAvg = (studentId) => {
    let weighted = 0, totalPct = 0
    activities.forEach(a => {
      const s = grades[studentId]?.[a.id]
      if (s !== null && s !== undefined) {
        weighted += parseFloat(s) * (a.percentage / 100)
        totalPct += a.percentage
      }
    })
    return totalPct > 0 ? Math.round((weighted / totalPct) * maxScore) : null
  }

  const createActivity = async () => {
    if (!newAct.name.trim() || !newAct.percentage) {
      setError('Nombre y porcentaje son obligatorios')
      return
    }
    
    const pct = parseFloat(newAct.percentage)
    const usedPct = activities.reduce((s, a) => s + a.percentage, 0)
    
    if (usedPct + pct > 100) {
      setError(`El porcentaje total no puede superar 100%. Ya tienes ${usedPct}% asignado.`)
      return
    }
    
    const teacherAssignmentId = newAct.teacher_assignment_id || assignments[0]?.id
    
    if (!teacherAssignmentId) {
      setError('No se ha seleccionado una clase/materia')
      return
    }
    
    try {
      let academicPeriodId = null
      
      try {
        const periodRes = await api.get('/academics/academic-periods/')
        const periods = periodRes.data.results || periodRes.data || []
        const activePeriod = periods.find(p => p.is_active === true) || periods[0]
        
        if (activePeriod) {
          academicPeriodId = activePeriod.id
        } else {
          setError('No hay periodos académicos configurados. Contacta al administrador.')
          return
        }
      } catch (e) {
        setError('Error al obtener el periodo académico')
        return
      }
      
      const activityData = {
        name: newAct.name,
        percentage: pct,
        date: newAct.date,
        teacher_assignment_id: teacherAssignmentId,
        academic_period: academicPeriodId,
      }
      
      await api.post('/grades/activities/create/', activityData)
      
      setShowNewActivity(false)
      setNewAct({ name: '', percentage: '', date: new Date().toISOString().split('T')[0], teacher_assignment_id: '' })
      setError('')
      toast('Actividad creada')
      loadAll()
    } catch (error) {
      setError('Error al crear la actividad')
    }
  }

  const exportCSV = () => {
    const header = ['Estudiante', ...activities.map(a => `${a.name} (${a.percentage}%)`), 'Promedio'].join(',')
    const rows = filteredStudents.map(s => {
      const id = s.real_id || s.student
      const name = s.student_name || s.full_name || s.name
      const scores = activities.map(a => grades[id]?.[a.id] ?? '')
      const avg = calcAvg(id)
      return [name, ...scores, avg ?? ''].join(',')
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'calificaciones.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const totalPct = activities.reduce((s, a) => s + (a.percentage || 0), 0)
  const currentClass = assignments.find(a => a.id === parseInt(selectedAssignment))

  if (loading) return (
    <Box display="flex" justifyContent="center" py={6}><CircularProgress size={28} /></Box>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: '#AAA', mb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Módulo de calificaciones
          </Typography>
          <Typography sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, color: '#1A1A2E', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Gestión de notas
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box component="button" onClick={exportCSV}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1, borderRadius: '8px', border: '0.5px solid', borderColor: 'divider', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#555', '&:hover': { background: '#F5F3EE' }, fontFamily: '"DM Sans", sans-serif' }}>
            <FileDownloadOutlined sx={{ fontSize: 16 }} /> Exportar
          </Box>
          <Box component="button" onClick={() => setShowNewActivity(true)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 1, borderRadius: '8px', border: 'none', bgcolor: '#1A1A2E', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', '&:hover': { opacity: 0.88 }, fontFamily: '"DM Sans", sans-serif' }}>
            <AddOutlined sx={{ fontSize: 16 }} /> Nueva actividad
          </Box>
        </Box>
      </Box>

      {assignments.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel sx={{ fontSize: 13 }}>Materia / Clase</InputLabel>
            <Select 
              value={selectedAssignment} 
              onChange={(e) => setSelectedAssignment(e.target.value)} 
              label="Materia / Clase" 
              sx={{ fontSize: 13 }}
            >
              {assignments.map(a => (
                <MenuItem key={a.id} value={a.id} sx={{ fontSize: 13 }}>
                  {a.subject_name} — {a.grade_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {currentClass && (
            <Typography sx={{ fontSize: 11, color: '#AAA', mt: 0.5 }}>
              Mostrando {filteredStudents.length} estudiantes de {currentClass.grade_name}
            </Typography>
          )}
        </Box>
      )}

      {activities.length > 0 && (
        <Box sx={{ mb: 2.5, p: '14px 18px', borderRadius: '12px', border: '0.5px solid', borderColor: 'divider', background: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Typography sx={{ fontSize: 12, color: '#888' }}>
              Actividades del periodo — {activities.length} creadas
            </Typography>
            <Box
              sx={{
                px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, fontWeight: 600,
                background: totalPct === 100 ? '#EAF3DE' : totalPct > 100 ? '#FCEBEB' : '#FAEEDA',
                color: totalPct === 100 ? '#27500A' : totalPct > 100 ? '#501313' : '#633806',
                border: `0.5px solid ${totalPct === 100 ? '#639922' : totalPct > 100 ? '#A32D2D' : '#BA7517'}`,
              }}
            >
              {totalPct}% del periodo {totalPct === 100 ? 'Completo' : totalPct > 100 ? 'Excede 100%' : `faltan ${100 - totalPct}%`}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {activities.map(a => (
              <Box key={a.id}
                sx={{ px: 1.25, py: 0.5, borderRadius: '20px', border: '0.5px solid #E0DDD8', background: '#FAFAF8', fontSize: 11, color: '#555' }}>
                {a.name} · <strong>{a.percentage}%</strong>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: '14px', overflow: 'hidden', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Sans", sans-serif', minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#F5F3EE' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '0.5px solid #E0DDD8', width: 44 }}>#</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '0.5px solid #E0DDD8' }}>Estudiante</th>
              {activities.map(a => (
                <th key={a.id} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '0.5px solid #E0DDD8', minWidth: 100 }}>
                  <div>{a.name}</div>
                  <div style={{ fontWeight: 400, color: '#BBB', marginTop: 2 }}>{a.percentage}%</div>
                </th>
              ))}
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '0.5px solid #E0DDD8', minWidth: 80 }}>Promedio</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '0.5px solid #E0DDD8', minWidth: 80 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={activities.length + 4} style={{ padding: '40px', textAlign: 'center', color: '#AAA', fontSize: 13 }}>
                  {assignments.length === 0 ? 'No tienes clases asignadas' : 'No hay estudiantes en esta clase'}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const id = student.real_id || student.student
                const name = student.student_name || student.full_name || student.name || ''
                const avg = calcAvg(id)
                const { bg: avatarBg, fg: avatarFg } = getAvatarColor(name)

                return (
                  <tr key={id} style={{ borderBottom: idx === filteredStudents.length - 1 ? 'none' : '0.5px solid #F0EDE8', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#CCC' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg, color: avatarFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                          {getInitials(name)}
                        </div>
                        <span style={{ fontSize: 13, color: '#1A1A2E' }}>{name}</span>
                      </div>
                    </td>
                    {activities.map(a => {
                      const isEdit = editing === `${id}-${a.id}`
                      return (
                        <td key={a.id} style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <ScoreCell
                            value={isEdit ? editValue : grades[id]?.[a.id]}
                            onChange={setEditValue}
                            onSave={() => saveGrade(id, a.id)}
                            editing={isEdit}
                            onStartEdit={() => startEdit(id, a.id)}
                            onCancel={() => setEditing(null)}
                            maxScore={maxScore}
                          />
                        </td>
                      )
                    })}
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <ScoreBadge score={avg} minGrade={minGrade} maxScore={maxScore} />
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      {avg === null ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, background: '#F5F3EE', color: '#AAA' }}>
                          <RemoveOutlined sx={{ fontSize: 12 }} /> Sin calificar
                        </Box>
                      ) : avg >= minGrade ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, background: '#EAF3DE', color: '#27500A' }}>
                          <TrendingUpOutlined sx={{ fontSize: 12 }} /> Aprobado
                        </Box>
                      ) : (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, background: '#FCEBEB', color: '#501313' }}>
                          <TrendingDownOutlined sx={{ fontSize: 12 }} /> Reprobado
                        </Box>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Box>

      <Dialog open={showNewActivity} onClose={() => { setShowNewActivity(false); setError('') }} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', fontFamily: '"DM Sans", sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontWeight: 400, pb: 1 }}>
          Nueva actividad
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '8px', fontSize: 13 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormField label="Nombre de la actividad" required>
              <StyledInput value={newAct.name} onChange={e => setNewAct(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Parcial 1, Taller de fracciones..." />
            </FormField>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <FormField label="Porcentaje (%)" required hint={`Disponible: ${100 - totalPct}%`}>
                <StyledInput type="number" value={newAct.percentage} onChange={e => setNewAct(p => ({ ...p, percentage: e.target.value }))} placeholder="Ej: 20" min={1} max={100 - totalPct} />
              </FormField>
              <FormField label="Fecha">
                <StyledInput type="date" value={newAct.date} onChange={e => setNewAct(p => ({ ...p, date: e.target.value }))} />
              </FormField>
            </Box>
            {assignments.length > 1 && (
              <FormField label="Materia / Clase">
                <FormControl size="small" fullWidth>
                  <Select value={newAct.teacher_assignment_id || assignments[0]?.id || ''}
                    onChange={e => setNewAct(p => ({ ...p, teacher_assignment_id: e.target.value }))}
                    sx={{ fontSize: 13, borderRadius: '10px' }}>
                    {assignments.map(a => (
                      <MenuItem key={a.id} value={a.id} sx={{ fontSize: 13 }}>
                        {a.subject_name} — {a.grade_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FormField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Box component="button" onClick={() => { setShowNewActivity(false); setError('') }}
            sx={{ px: 2, py: 1, borderRadius: '8px', border: '0.5px solid', borderColor: 'divider', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#555', fontFamily: '"DM Sans", sans-serif' }}>
            Cancelar
          </Box>
          <Box component="button" onClick={createActivity}
            sx={{ px: 2, py: 1, borderRadius: '8px', border: 'none', bgcolor: '#1A1A2E', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', '&:hover': { opacity: 0.88 } }}>
            Crear actividad
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ fontSize: 13, borderRadius: '10px' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ── Vista estudiante ──────────────────────────────────────────────────────────
const StudentView = () => {
  const { settings, getMaxScore } = useSettings()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get('/grades/my-grades/')
        setActivities(Array.isArray(r.data) ? r.data : (r.data?.results || []))
      } catch {
        setError('Error al cargar tus calificaciones')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress size={28} /></Box>

  const minGrade = settings.min_grade || 60
  const maxScore = getMaxScore()
  const total = activities.length
  const gradedActivities = activities.filter(a => a.score !== null && a.score !== undefined)
  const avg = gradedActivities.length > 0 
    ? Math.round(gradedActivities.reduce((s, a) => s + a.score, 0) / gradedActivities.length)
    : null
  const approved = gradedActivities.filter(a => a.score >= minGrade).length

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 12, color: '#AAA', mb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Mis calificaciones
        </Typography>
        <Typography sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, color: '#1A1A2E', letterSpacing: '-0.02em' }}>
          Historial de notas
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {avg !== null && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Promedio', value: `${avg} / ${maxScore}`, style: getScoreStyle(avg, minGrade, maxScore) },
            { label: 'Aprobadas', value: approved, style: { color: '#27500A', bg: '#EAF3DE', border: '#639922' } },
            { label: 'En riesgo', value: gradedActivities.length - approved, style: (gradedActivities.length - approved) > 0 ? { color: '#501313', bg: '#FCEBEB', border: '#A32D2D' } : { color: '#888', bg: '#F5F3EE', border: '#E0DDD8' } },
          ].map(s => (
            <Box key={s.label} sx={{ px: 2, py: 1.25, borderRadius: '12px', background: s.style?.bg || '#F5F3EE', border: `0.5px solid ${s.style?.border || '#E0DDD8'}` }}>
              <Typography sx={{ fontSize: 10, color: s.style?.color || '#888', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
              <Typography sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 28, color: s.style?.color || '#888', lineHeight: 1 }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: '14px', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', px: 2, py: 1.25, background: '#F5F3EE', borderBottom: '0.5px solid', borderColor: 'divider', gap: 2 }}>
          {['Materia', 'Actividad', '%', 'Nota', 'Estado'].map((h, i) => (
            <Typography key={h} sx={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: i >= 2 ? 'center' : 'left' }}>
              {h}
            </Typography>
          ))}
        </Box>
        {activities.length === 0 ? (
          <Box py={5} textAlign="center">
            <Typography sx={{ fontSize: 13, color: '#AAA' }}>No hay actividades registradas aún</Typography>
          </Box>
        ) : (
          activities.map((a, i) => {
            const score = a.score
            const approved = score !== null && score !== undefined && score >= minGrade
            return (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', px: 2, py: 1.25, gap: 2, alignItems: 'center', borderBottom: i === activities.length - 1 ? 'none' : '0.5px solid', borderColor: 'divider', '&:hover': { background: '#FAFAF8' } }}>
                <Typography sx={{ fontSize: 13, color: '#555' }}>{a.subject_name || a.subject}</Typography>
                <Typography sx={{ fontSize: 13, color: '#1A1A2E', fontWeight: 450 }}>{a.name}</Typography>
                <Typography sx={{ fontSize: 12, color: '#888', textAlign: 'center', minWidth: 32 }}>{a.percentage}%</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ScoreBadge score={score} minGrade={minGrade} maxScore={maxScore} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {score === null || score === undefined ? (
                    <Box sx={{ px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, background: '#F5F3EE', color: '#AAA' }}>Pendiente</Box>
                  ) : approved ? (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, background: '#EAF3DE', color: '#27500A' }}>
                      <CheckCircleOutlined sx={{ fontSize: 11 }} /> Aprobado
                    </Box>
                  ) : (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4, borderRadius: '20px', fontSize: 11, background: '#FCEBEB', color: '#501313' }}>
                      <CancelOutlined sx={{ fontSize: 11 }} /> Reprobado
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
const Grades = () => {
  const { user } = useAuth()
  return (
    <>
      <style>{FONT}</style>
      <Box sx={{ fontFamily: '"DM Sans", sans-serif', maxWidth: 1100, pb: 4 }}>
        {user?.role === 'student' ? <StudentView /> : <TeacherView />}
      </Box>
    </>
  )
}

export default Grades