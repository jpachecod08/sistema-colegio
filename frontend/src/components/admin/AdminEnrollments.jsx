// components/admin/AdminEnrollments.jsx
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
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  School,
  Upload,
  Download,
  PersonAdd,
  GroupAdd,
  FileUpload
} from '@mui/icons-material'
import api from '../../services/api'

const AdminEnrollments = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  const [tabValue, setTabValue] = useState(0)
  const [enrollments, setEnrollments] = useState([])
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openMassiveDialog, setOpenMassiveDialog] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [formData, setFormData] = useState({
    student: '',
    grade: '',
    school_year: '',
    is_active: true
  })
  const [massiveForm, setMassiveForm] = useState({
    grade: '',
    school_year: '',
    enroll_all: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [csvData, setCsvData] = useState('')

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
      const enrollmentsRes = await api.get('/academics/enrollments/')
      setEnrollments(extractDataFromResponse(enrollmentsRes))

      const usersRes = await api.get('/users/list/')
      const allUsers = extractDataFromResponse(usersRes)
      setStudents(allUsers.filter(u => u.role === 'student'))

      const gradesRes = await api.get('/academics/grades/')
      setGrades(extractDataFromResponse(gradesRes))

      const yearsRes = await api.get('/academics/school-years/')
      const years = extractDataFromResponse(yearsRes)
      setSchoolYears(years)
      
      const activeYear = years.find(y => y.is_active)
      if (activeYear && !editingEnrollment) {
        setFormData(prev => ({ ...prev, school_year: activeYear.id }))
        setMassiveForm(prev => ({ ...prev, school_year: activeYear.id }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm('¿Estás seguro de eliminar esta matrícula?')) {
      try {
        await api.delete(`/academics/enrollments/${enrollmentId}/`)
        setSuccess('Matrícula eliminada exitosamente')
        fetchData()
      } catch (error) {
        console.error('Error deleting enrollment:', error)
        setError('Error al eliminar la matrícula')
      }
    }
  }

  const handleOpenDialog = (enrollment = null) => {
    if (enrollment) {
      setEditingEnrollment(enrollment)
      setFormData({
        student: enrollment.student,
        grade: enrollment.grade,
        school_year: enrollment.school_year,
        is_active: enrollment.is_active
      })
    } else {
      setEditingEnrollment(null)
      setFormData({
        student: '',
        grade: '',
        school_year: schoolYears.find(y => y.is_active)?.id || '',
        is_active: true
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingEnrollment(null)
  }

  const handleSubmit = async () => {
    if (!formData.student || !formData.grade || !formData.school_year) {
      setError('Todos los campos son requeridos')
      return
    }

    try {
      if (editingEnrollment) {
        await api.put(`/academics/enrollments/${editingEnrollment.id}/`, formData)
        setSuccess('Matrícula actualizada exitosamente')
      } else {
        await api.post('/academics/enrollments/', formData)
        setSuccess('Estudiante matriculado exitosamente')
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving enrollment:', error)
      setError(error.response?.data?.detail || 'Error al guardar la matrícula')
    }
  }

  const handleOpenMassiveDialog = () => {
    setSelectedStudents([])
    setMassiveForm({
      grade: grades[0]?.id || '',
      school_year: schoolYears.find(y => y.is_active)?.id || '',
      enroll_all: false
    })
    setOpenMassiveDialog(true)
  }

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  const handleMassiveSubmit = async () => {
    if (!massiveForm.grade || !massiveForm.school_year) {
      setError('Grado y año escolar son requeridos')
      return
    }

    if (selectedStudents.length === 0 && !massiveForm.enroll_all) {
      setError('Selecciona al menos un estudiante')
      return
    }

    let studentsToEnroll = selectedStudents
    if (massiveForm.enroll_all) {
      studentsToEnroll = students.map(s => s.id)
    }

    if (studentsToEnroll.length === 0) {
      setError('No hay estudiantes para matricular')
      return
    }

    try {
      const promises = studentsToEnroll.map(studentId =>
        api.post('/academics/enrollments/', {
          student: studentId,
          grade: massiveForm.grade,
          school_year: massiveForm.school_year,
          is_active: true
        }).catch(err => {
          console.error(`Error matriculando estudiante ${studentId}:`, err)
          return null
        })
      )
      
      await Promise.all(promises)
      setSuccess(`${studentsToEnroll.length} estudiantes matriculados exitosamente`)
      setOpenMassiveDialog(false)
      fetchData()
    } catch (error) {
      console.error('Error en matrícula masiva:', error)
      setError('Error al procesar las matrículas')
    }
  }

  const handleCsvUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n')
      const studentsCsv = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line) {
          const [username, firstName, lastName, email] = line.split(',')
          studentsCsv.push({ username, firstName, lastName, email })
        }
      }
      
      createStudentsFromCsv(studentsCsv)
    }
    reader.readAsText(file)
  }

  const createStudentsFromCsv = async (studentsData) => {
    setLoading(true)
    let created = 0
    let errors = 0

    for (const student of studentsData) {
      try {
        await api.post('/users/register/', {
          username: student.username.trim(),
          email: student.email?.trim() || `${student.username.trim()}@colegio.edu.co`,
          password: 'estudiante123',
          confirm_password: 'estudiante123',
          first_name: student.firstName?.trim() || '',
          last_name: student.lastName?.trim() || '',
          role: 'student'
        })
        created++
      } catch (err) {
        console.error('Error creando estudiante:', student.username, err)
        errors++
      }
    }

    setSuccess(`${created} estudiantes creados, ${errors} errores`)
    fetchData()
    setLoading(false)
  }

  const downloadCsvTemplate = () => {
    const headers = ['username', 'first_name', 'last_name', 'email']
    const example = ['estudiante1', 'María', 'García', 'maria@colegio.edu.co']
    const csvContent = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_matriculas.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student ? `${student.first_name} ${student.last_name}`.trim() || student.username : '—'
  }

  const getGradeName = (gradeId) => {
    const grade = grades.find(g => g.id === gradeId)
    return grade?.name || '—'
  }

  const getUnenrolledStudents = () => {
    const enrolledIds = enrollments.map(e => e.student)
    return students.filter(s => !enrolledIds.includes(s.id))
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
            Matrículas de Estudiantes
          </Typography>
        </Box>
        
        {/* Botones responsive - en columna en móvil */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              onClick={() => document.getElementById('csv-upload').click()}
              sx={{ 
                fontSize: { xs: 11, sm: 12 },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {isMobile ? 'CSV' : 'Cargar CSV'}
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleCsvUpload}
            />
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadCsvTemplate}
              sx={{ 
                fontSize: { xs: 11, sm: 12 },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {isMobile ? 'Plantilla' : 'Plantilla CSV'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<GroupAdd />}
              onClick={handleOpenMassiveDialog}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                '&:hover': { opacity: 0.9 },
                fontSize: { xs: 11, sm: 12 },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {isMobile ? 'Masiva' : 'Matrícula Masiva'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
                '&:hover': { opacity: 0.9 },
                fontSize: { xs: 11, sm: 12 },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {isMobile ? 'Individual' : 'Matricular Individual'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs Responsive */}
      <Tabs 
        value={tabValue} 
        onChange={(e, v) => setTabValue(v)} 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          '& .MuiTab-root': {
            fontSize: { xs: 12, sm: 13 },
            minWidth: { xs: 'auto', sm: 120 },
            px: { xs: 1.5, sm: 2 }
          }
        }}
        variant={isMobile ? "fullWidth" : "standard"}
      >
        <Tab label="Matrículas Activas" />
        <Tab label="Sin Matricular" />
      </Tabs>

      {/* Tabla de matrículas activas - Responsive */}
      {tabValue === 0 && (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '14px', 
            border: '0.5px solid #E0DDD8',
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: isMobile ? 500 : 'auto' }}>
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Grado</TableCell>
                {!isMobile && (
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Año Escolar</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.filter(e => e.is_active).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 4 : 5} align="center">
                    <Box sx={{ py: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                      <School sx={{ fontSize: { xs: 36, sm: 48 }, color: '#CCC', mb: 1 }} />
                      <Typography sx={{ color: '#AAA', fontSize: { xs: 12, sm: 13 } }}>
                        No hay estudiantes matriculados
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.filter(e => e.is_active).map((enrollment) => (
                  <TableRow key={enrollment.id} hover>
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 }, wordBreak: 'break-word' }}>
                      {getStudentName(enrollment.student)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {getGradeName(enrollment.grade)}
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                        {enrollment.school_year_name || enrollment.school_year}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={enrollment.is_active ? 'Activo' : 'Inactivo'}
                        sx={{
                          backgroundColor: enrollment.is_active ? '#10B98120' : '#EF444420',
                          color: enrollment.is_active ? '#10B981' : '#EF4444',
                          fontSize: { xs: 10, sm: 12 },
                          height: { xs: 24, sm: 32 }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(enrollment)}
                        sx={{ color: '#6C63FF', p: { xs: 0.5, sm: 0.75 } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
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
      )}

      {/* Tabla de estudiantes sin matricular - Responsive */}
      {tabValue === 1 && (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '14px', 
            border: '0.5px solid #E0DDD8',
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: isMobile ? 400 : 'auto' }}>
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getUnenrolledStudents().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography sx={{ py: { xs: 3, sm: 4 }, color: '#AAA', fontSize: { xs: 12, sm: 13 } }}>
                      Todos los estudiantes están matriculados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getUnenrolledStudents().map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 }, wordBreak: 'break-word' }}>
                      {`${student.first_name} ${student.last_name}`.trim() || student.username}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 11, sm: 12 } }}>
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setFormData({
                            student: student.id,
                            grade: grades[0]?.id || '',
                            school_year: schoolYears.find(y => y.is_active)?.id || '',
                            is_active: true
                          })
                          setOpenDialog(true)
                        }}
                        sx={{ 
                          fontSize: { xs: 11, sm: 12 },
                          px: { xs: 1, sm: 1.5 }
                        }}
                      >
                        Matricular
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para matrícula individual - Responsive */}
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
          {editingEnrollment ? 'Editar Matrícula' : 'Nueva Matrícula'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Estudiante</InputLabel>
              <Select
                name="student"
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                label="Estudiante"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {`${student.first_name} ${student.last_name}`.trim() || student.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Grado</InputLabel>
              <Select
                name="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                label="Grado"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Año Escolar</InputLabel>
              <Select
                name="school_year"
                value={formData.school_year}
                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
                label="Año Escolar"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                {schoolYears.map((year) => (
                  <MenuItem key={year.id} value={year.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {year.name} {year.is_active ? '(Activo)' : ''}
                  </MenuItem>
                ))}
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
            {editingEnrollment ? 'Actualizar' : 'Matricular'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para matrícula masiva - Responsive */}
      <Dialog 
        open={openMassiveDialog} 
        onClose={() => setOpenMassiveDialog(false)} 
        maxWidth="md" 
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
          Matrícula Masiva de Estudiantes
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Grado</InputLabel>
                  <Select
                    value={massiveForm.grade}
                    onChange={(e) => setMassiveForm({ ...massiveForm, grade: e.target.value })}
                    label="Grado"
                    sx={{ fontSize: { xs: 12, sm: 13 } }}
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade.id} value={grade.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                        {grade.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Año Escolar</InputLabel>
                  <Select
                    value={massiveForm.school_year}
                    onChange={(e) => setMassiveForm({ ...massiveForm, school_year: e.target.value })}
                    label="Año Escolar"
                    sx={{ fontSize: { xs: 12, sm: 13 } }}
                  >
                    {schoolYears.map((year) => (
                      <MenuItem key={year.id} value={year.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={massiveForm.enroll_all}
                    onChange={(e) => setMassiveForm({ ...massiveForm, enroll_all: e.target.checked })}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: { xs: 18, sm: 20 } } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    Matricular todos los estudiantes
                  </Typography>
                }
              />
              
              {!massiveForm.enroll_all && (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: 2,
                    gap: 1
                  }}>
                    <Typography variant="subtitle2" sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      Seleccionar estudiantes:
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={handleSelectAll}
                      sx={{ fontSize: { xs: 11, sm: 12 } }}
                    >
                      {selectedStudents.length === students.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </Button>
                  </Box>
                  <Paper sx={{ 
                    maxHeight: 300, 
                    overflow: 'auto', 
                    p: 1 
                  }}>
                    {students.map((student) => (
                      <FormControlLabel
                        key={student.id}
                        control={
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleToggleStudent(student.id)}
                            sx={{ '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 18 } } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: { xs: 12, sm: 13 } }}>
                            {`${student.first_name} ${student.last_name}`.trim() || student.username}
                          </Typography>
                        }
                        sx={{ display: 'block', ml: 1, mb: 0.5 }}
                      />
                    ))}
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
          <Button onClick={() => setOpenMassiveDialog(false)} sx={{ fontSize: { xs: 12, sm: 13 } }}>
            Cancelar
          </Button>
          <Button
            onClick={handleMassiveSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': { opacity: 0.9 },
              fontSize: { xs: 12, sm: 13 },
              px: { xs: 2, sm: 3 }
            }}
          >
            Matricular Seleccionados
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

export default AdminEnrollments