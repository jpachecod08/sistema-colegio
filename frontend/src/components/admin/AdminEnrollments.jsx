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
  Divider
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
      // Obtener matrículas
      const enrollmentsRes = await api.get('/academics/enrollments/')
      setEnrollments(extractDataFromResponse(enrollmentsRes))

      // Obtener estudiantes
      const usersRes = await api.get('/users/list/')
      const allUsers = extractDataFromResponse(usersRes)
      setStudents(allUsers.filter(u => u.role === 'student'))

      // Obtener grados
      const gradesRes = await api.get('/academics/grades/')
      setGrades(extractDataFromResponse(gradesRes))

      // Obtener años escolares
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

  // Matrícula individual
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

  // Matrícula masiva - selección múltiple
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

  // Matrícula masiva por CSV
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
      
      // Crear estudiantes desde CSV
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

  // Obtener estudiantes no matriculados en un grado
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
            Matrículas de Estudiantes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={() => document.getElementById('csv-upload').click()}
          >
            Cargar CSV
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
          >
            Plantilla CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<GroupAdd />}
            onClick={handleOpenMassiveDialog}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Matrícula Masiva
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Matricular Individual
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Matrículas Activas" />
        <Tab label="Estudiantes sin Matricular" />
      </Tabs>

      {/* Tabla de matrículas activas */}
      {tabValue === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Año Escolar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.filter(e => e.is_active).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <School sx={{ fontSize: 48, color: '#CCC', mb: 1 }} />
                      <Typography sx={{ color: '#AAA' }}>
                        No hay estudiantes matriculados
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.filter(e => e.is_active).map((enrollment) => (
                  <TableRow key={enrollment.id} hover>
                    <TableCell>{getStudentName(enrollment.student)}</TableCell>
                    <TableCell>{getGradeName(enrollment.grade)}</TableCell>
                    <TableCell>{enrollment.school_year_name || enrollment.school_year}</TableCell>
                    <TableCell>
                      <Chip
                        label={enrollment.is_active ? 'Activo' : 'Inactivo'}
                        sx={{
                          backgroundColor: enrollment.is_active ? '#10B98120' : '#EF444420',
                          color: enrollment.is_active ? '#10B981' : '#EF4444'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(enrollment)}
                        sx={{ color: '#6C63FF' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
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
      )}

      {/* Tabla de estudiantes sin matricular */}
      {tabValue === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getUnenrolledStudents().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography sx={{ py: 4, color: '#AAA' }}>
                      Todos los estudiantes están matriculados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getUnenrolledStudents().map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{`${student.first_name} ${student.last_name}`.trim() || student.username}</TableCell>
                    <TableCell>{student.email}</TableCell>
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

      {/* Dialog para matrícula individual */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEnrollment ? 'Editar Matrícula' : 'Nueva Matrícula'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth size="small" required>
              <InputLabel>Estudiante</InputLabel>
              <Select
                name="student"
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                label="Estudiante"
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {`${student.first_name} ${student.last_name}`.trim() || student.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel>Grado</InputLabel>
              <Select
                name="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                label="Grado"
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel>Año Escolar</InputLabel>
              <Select
                name="school_year"
                value={formData.school_year}
                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
                label="Año Escolar"
              >
                {schoolYears.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name} {year.is_active ? '(Activo)' : ''}
                  </MenuItem>
                ))}
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
            {editingEnrollment ? 'Actualizar' : 'Matricular'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para matrícula masiva */}
      <Dialog open={openMassiveDialog} onClose={() => setOpenMassiveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Matrícula Masiva de Estudiantes</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Grado</InputLabel>
                  <Select
                    value={massiveForm.grade}
                    onChange={(e) => setMassiveForm({ ...massiveForm, grade: e.target.value })}
                    label="Grado"
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Año Escolar</InputLabel>
                  <Select
                    value={massiveForm.school_year}
                    onChange={(e) => setMassiveForm({ ...massiveForm, school_year: e.target.value })}
                    label="Año Escolar"
                  >
                    {schoolYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
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
                  />
                }
                label="Matricular todos los estudiantes"
              />
              
              {!massiveForm.enroll_all && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Seleccionar estudiantes:</Typography>
                    <Button size="small" onClick={handleSelectAll}>
                      {selectedStudents.length === students.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </Button>
                  </Box>
                  <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                    {students.map((student) => (
                      <FormControlLabel
                        key={student.id}
                        control={
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleToggleStudent(student.id)}
                          />
                        }
                        label={`${student.first_name} ${student.last_name}`.trim() || student.username}
                        sx={{ display: 'block', ml: 1 }}
                      />
                    ))}
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMassiveDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleMassiveSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': { opacity: 0.9 }
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
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminEnrollments