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
  Select,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack, School, Person } from '@mui/icons-material'
import api from '../../services/api'

const AdminAssignments = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
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
      const assignmentsRes = await api.get('/academics/teacher-assignments/')
      setAssignments(extractDataFromResponse(assignmentsRes))

      const teachersRes = await api.get('/users/list/')
      const allUsers = extractDataFromResponse(teachersRes)
      setTeachers(allUsers.filter(u => u.role === 'teacher'))

      const gradesRes = await api.get('/academics/grades/')
      setGrades(extractDataFromResponse(gradesRes))

      const subjectsRes = await api.get('/academics/subjects/')
      setSubjects(extractDataFromResponse(subjectsRes))

      const yearsRes = await api.get('/academics/school-years/')
      setSchoolYears(extractDataFromResponse(yearsRes))
      
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
    <Box sx={{ 
      p: { xs: 1.5, sm: 2, md: 3 },
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header Responsive */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap'
        }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/admin')}
            startIcon={<ArrowBack />}
            sx={{ 
              borderRadius: '8px',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 0.75 },
              fontSize: { xs: 12, sm: 13 }
            }}
          >
            Volver
          </Button>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: '"Instrument Serif", serif',
              fontSize: { xs: 20, sm: 28, md: 32 }
            }}
          >
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
            textTransform: 'none',
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: 12, sm: 13 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Nueva Asignación
        </Button>
      </Box>

      {/* Tabla de asignaciones - Responsive con scroll horizontal */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '14px', 
          border: '0.5px solid #E0DDD8',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Profesor</TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Clase/Grado</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Materia</TableCell>
                </>
              )}
              {isMobile && (
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Clase/Materia</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Año</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                    <School sx={{ fontSize: { xs: 36, sm: 48 }, color: '#CCC', mb: 1 }} />
                    <Typography sx={{ color: '#AAA', fontSize: { xs: 12, sm: 13 } }}>
                      No hay asignaciones de profesores
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2, fontSize: { xs: 11, sm: 12 } }}
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
                      <Person sx={{ fontSize: { xs: 14, sm: 16 }, color: '#6C63FF' }} />
                      <Typography sx={{ 
                        fontWeight: 500, 
                        fontSize: { xs: 12, sm: 13 },
                        wordBreak: 'break-word'
                      }}>
                        {getTeacherName(assignment.teacher)}
                      </Typography>
                    </Box>
                  </TableCell>
                  {!isMobile ? (
                    <>
                      <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                        {getGradeName(assignment.grade)}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                        {getSubjectName(assignment.subject)}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      <Typography variant="caption" display="block" sx={{ fontSize: 11, color: '#888' }}>
                        {getGradeName(assignment.grade)}
                      </Typography>
                      {getSubjectName(assignment.subject)}
                    </TableCell>
                  )}
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {assignment.school_year_name || assignment.school_year}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.is_active ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: assignment.is_active ? '#10B98120' : '#EF444420',
                        color: assignment.is_active ? '#10B981' : '#EF4444',
                        fontSize: { xs: 10, sm: 12 },
                        height: { xs: 24, sm: 32 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(assignment)}
                      sx={{ color: '#6C63FF', p: { xs: 0.5, sm: 0.75 } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      sx={{ color: '#EF4444', p: { xs: 0.5, sm: 0.75 } }}
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

      {/* Dialog Responsive */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '12px' },
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Instrument Serif", serif', 
          fontSize: { xs: 20, sm: 24 },
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 }
        }}>
          {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Profesor</InputLabel>
              <Select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                label="Profesor"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {teachers.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: { xs: 12, sm: 13 } }}>No hay profesores registrados</MenuItem>
                ) : (
                  teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {`${teacher.first_name} ${teacher.last_name}`.trim() || teacher.username}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Clase / Grado</InputLabel>
              <Select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                label="Clase / Grado"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {grades.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: { xs: 12, sm: 13 } }}>No hay clases registradas</MenuItem>
                ) : (
                  grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {grade.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Materia</InputLabel>
              <Select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                label="Materia"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {subjects.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: { xs: 12, sm: 13 } }}>No hay materias registradas</MenuItem>
                ) : (
                  subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {subject.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Año Escolar</InputLabel>
              <Select
                name="school_year"
                value={formData.school_year}
                onChange={handleChange}
                label="Año Escolar"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {schoolYears.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: { xs: 12, sm: 13 } }}>No hay años escolares registrados</MenuItem>
                ) : (
                  schoolYears.map((year) => (
                    <MenuItem key={year.id} value={year.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {year.name} {year.is_active ? '(Activo)' : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Estado</InputLabel>
              <Select
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                label="Estado"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                <MenuItem value={true} sx={{ fontSize: { xs: 12, sm: 13 } }}>Activo</MenuItem>
                <MenuItem value={false} sx={{ fontSize: { xs: 12, sm: 13 } }}>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
          <Button onClick={handleCloseDialog} sx={{ fontSize: { xs: 12, sm: 13 } }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
              '&:hover': { opacity: 0.9 },
              fontSize: { xs: 12, sm: 13 },
              px: { xs: 2, sm: 3 }
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
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminAssignments