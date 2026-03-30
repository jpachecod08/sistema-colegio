import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack, School, Person } from '@mui/icons-material'
import api from '../../services/api'

const AdminAssignments = () => {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [teachers, setTeachers] = useState([])
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    teacher: '',
    grade: '',
    subject: '',
    school_year: '',
    is_active: true
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Obtener todas las asignaciones
      const assignmentsRes = await api.get('/academics/teacher-assignments/')
      setAssignments(extractDataFromResponse(assignmentsRes))

      // Obtener profesores
      const teachersRes = await api.get('/users/list/')
      const allUsers = extractDataFromResponse(teachersRes)
      setTeachers(allUsers.filter(u => u.role === 'teacher'))

      // Obtener grados
      const gradesRes = await api.get('/academics/grades/')
      setGrades(extractDataFromResponse(gradesRes))

      // Obtener materias
      const subjectsRes = await api.get('/academics/subjects/')
      setSubjects(extractDataFromResponse(subjectsRes))

      // Obtener años escolares
      const yearsRes = await api.get('/academics/school-years/')
      setSchoolYears(extractDataFromResponse(yearsRes))
      
      // Seleccionar año activo por defecto
      const activeYear = extractDataFromResponse(yearsRes).find(y => y.is_active)
      if (activeYear && !editingAssignment) {
        setFormData(prev => ({ ...prev, school_year: activeYear.id }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment)
      setFormData({
        teacher: assignment.teacher,
        grade: assignment.grade,
        subject: assignment.subject,
        school_year: assignment.school_year,
        is_active: assignment.is_active
      })
    } else {
      setEditingAssignment(null)
      setFormData({
        teacher: '',
        grade: '',
        subject: '',
        school_year: schoolYears.find(y => y.is_active)?.id || '',
        is_active: true
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingAssignment(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    if (!formData.teacher || !formData.grade || !formData.subject || !formData.school_year) {
      setError('Todos los campos son requeridos')
      return
    }

    try {
      if (editingAssignment) {
        await api.put(`/academics/teacher-assignments/${editingAssignment.id}/`, formData)
        setSuccess('Asignación actualizada exitosamente')
      } else {
        await api.post('/academics/teacher-assignments/', formData)
        setSuccess('Asignación creada exitosamente')
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving assignment:', error)
      const errorMsg = error.response?.data?.non_field_errors?.[0] ||
                       error.response?.data?.detail ||
                       'Error al guardar la asignación'
      setError(errorMsg)
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignación?')) {
      try {
        await api.delete(`/academics/teacher-assignments/${assignmentId}/`)
        setSuccess('Asignación eliminada exitosamente')
        fetchData()
      } catch (error) {
        console.error('Error deleting assignment:', error)
        setError('Error al eliminar la asignación')
      }
    }
  }

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher ? `${teacher.first_name} ${teacher.last_name}`.trim() || teacher.username : '—'
  }

  const getGradeName = (gradeId) => {
    const grade = grades.find(g => g.id === gradeId)
    return grade?.name || '—'
  }

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.name || '—'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/admin')}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: '8px' }}
          >
            Volver
          </Button>
          <Typography variant="h4" sx={{ fontFamily: '"Instrument Serif", serif' }}>
            Asignación de Profesores
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
            '&:hover': { opacity: 0.9 },
            borderRadius: '10px',
            textTransform: 'none'
          }}
        >
          Nueva Asignación
        </Button>
      </Box>

      {/* Tabla de asignaciones */}
      <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600 }}>Profesor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Clase/Grado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Materia</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Año Escolar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <School sx={{ fontSize: 48, color: '#CCC', mb: 1 }} />
                    <Typography sx={{ color: '#AAA' }}>
                      No hay asignaciones de profesores
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      Crear primera asignación
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: '#6C63FF' }} />
                      <Typography sx={{ fontWeight: 500 }}>
                        {getTeacherName(assignment.teacher)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getGradeName(assignment.grade)}</TableCell>
                  <TableCell>{getSubjectName(assignment.subject)}</TableCell>
                  <TableCell>{assignment.school_year_name || assignment.school_year}</TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.is_active ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: assignment.is_active ? '#10B98120' : '#EF444420',
                        color: assignment.is_active ? '#10B981' : '#EF4444',
                        fontSize: 12
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(assignment)}
                      sx={{ color: '#6C63FF' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      sx={{ color: '#EF4444' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar asignación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 24 }}>
          {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px' }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth size="small" required>
              <InputLabel>Profesor</InputLabel>
              <Select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                label="Profesor"
              >
                {teachers.length === 0 ? (
                  <MenuItem disabled>No hay profesores registrados</MenuItem>
                ) : (
                  teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {`${teacher.first_name} ${teacher.last_name}`.trim() || teacher.username}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel>Clase / Grado</InputLabel>
              <Select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                label="Clase / Grado"
              >
                {grades.length === 0 ? (
                  <MenuItem disabled>No hay clases registradas</MenuItem>
                ) : (
                  grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel>Materia</InputLabel>
              <Select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                label="Materia"
              >
                {subjects.length === 0 ? (
                  <MenuItem disabled>No hay materias registradas</MenuItem>
                ) : (
                  subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel>Año Escolar</InputLabel>
              <Select
                name="school_year"
                value={formData.school_year}
                onChange={handleChange}
                label="Año Escolar"
              >
                {schoolYears.length === 0 ? (
                  <MenuItem disabled>No hay años escolares registrados</MenuItem>
                ) : (
                  schoolYears.map((year) => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name} {year.is_active ? '(Activo)' : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                label="Estado"
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            {editingAssignment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: '10px' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminAssignments