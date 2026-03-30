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
  Snackbar,
  Switch,
  FormControlLabel,
  CircularProgress,
  MenuItem
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack, School } from '@mui/icons-material'
import api from '../../services/api'

const AdminClasses = () => {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    order: '',
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
    fetchClasses()
    fetchSchoolYears()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/academics/grades/')
      const data = extractDataFromResponse(response)
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
      setError('Error al cargar las clases')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchoolYears = async () => {
    try {
      const response = await api.get('/academics/school-years/')
      const data = extractDataFromResponse(response)
      setSchoolYears(data)
      // Si hay años escolares y es nuevo formulario, seleccionar el primero
      if (data.length > 0 && !editingClass) {
        setFormData(prev => ({ ...prev, school_year: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem)
      setFormData({
        name: classItem.name,
        order: classItem.order || '',
        school_year: classItem.school_year,
        is_active: classItem.is_active !== false
      })
    } else {
      setEditingClass(null)
      setFormData({
        name: '',
        order: '',
        school_year: schoolYears.length > 0 ? schoolYears[0].id : '',
        is_active: true
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingClass(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('El nombre de la clase es requerido')
      return
    }
    if (!formData.order) {
      setError('El orden es requerido')
      return
    }
    if (!formData.school_year) {
      setError('El año escolar es requerido')
      return
    }

    try {
      const dataToSend = {
        name: formData.name,
        order: parseInt(formData.order),
        school_year: parseInt(formData.school_year),
        is_active: formData.is_active
      }
      
      if (editingClass) {
        await api.put(`/academics/grades/${editingClass.id}/`, dataToSend)
        setSuccess('Clase actualizada exitosamente')
      } else {
        await api.post('/academics/grades/', dataToSend)
        setSuccess('Clase creada exitosamente')
      }
      handleCloseDialog()
      fetchClasses()
    } catch (error) {
      console.error('Error saving class:', error)
      console.error('Response data:', error.response?.data)
      const errorMsg = error.response?.data?.name?.[0] || 
                       error.response?.data?.order?.[0] ||
                       error.response?.data?.school_year?.[0] ||
                       error.response?.data?.detail || 
                       'Error al guardar la clase'
      setError(errorMsg)
    }
  }

  const handleDeleteClass = async (classId) => {
    if (window.confirm('¿Estás seguro de eliminar esta clase? Esto también eliminará las asignaciones relacionadas.')) {
      try {
        await api.delete(`/academics/grades/${classId}/`)
        setSuccess('Clase eliminada exitosamente')
        fetchClasses()
      } catch (error) {
        console.error('Error deleting class:', error)
        setError('Error al eliminar la clase')
      }
    }
  }

  const handleToggleActive = async (classItem) => {
    try {
      await api.patch(`/academics/grades/${classItem.id}/`, {
        is_active: !classItem.is_active
      })
      setSuccess(`Clase ${!classItem.is_active ? 'activada' : 'desactivada'} exitosamente`)
      fetchClasses()
    } catch (error) {
      console.error('Error toggling class:', error)
      setError('Error al cambiar el estado de la clase')
    }
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
            Gestión de Clases (Grados)
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
          Nueva Clase
        </Button>
      </Box>

      {/* Tabla de clases */}
      <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Orden</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Año Escolar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <School sx={{ fontSize: 48, color: '#CCC', mb: 1 }} />
                    <Typography sx={{ color: '#AAA' }}>
                      No hay clases registradas
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      Crear primera clase
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <TableRow key={classItem.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{classItem.name}</Typography>
                  </TableCell>
                  <TableCell>{classItem.order}</TableCell>
                  <TableCell>{classItem.school_year_name || classItem.school_year}</TableCell>
                  <TableCell>
                    <Chip
                      label={classItem.is_active !== false ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: classItem.is_active !== false ? '#10B98120' : '#EF444420',
                        color: classItem.is_active !== false ? '#10B981' : '#EF4444',
                        fontSize: 12
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(classItem)}
                      sx={{ color: '#6C63FF' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleActive(classItem)}
                      sx={{ color: classItem.is_active !== false ? '#F59E0B' : '#10B981' }}
                    >
                      {classItem.is_active !== false ? '🔴' : '🟢'}
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteClass(classItem.id)}
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

      {/* Dialog para crear/editar clase */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 24 }}>
          {editingClass ? 'Editar Clase' : 'Crear Nueva Clase'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px' }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Nombre de la clase"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              placeholder="Ej: 1° Primaria, 6° Secundaria, 10° A"
              helperText="Ejemplos: 1° Primaria, 2° Primaria, 6° Secundaria, 10° A"
            />
            
            <TextField
              label="Orden"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              placeholder="Ej: 1, 2, 3..."
              helperText="Número de orden (1 = primer grado, 2 = segundo grado, etc.)"
            />
            
            <TextField
              select
              label="Año Escolar"
              name="school_year"
              value={formData.school_year}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              disabled={schoolYears.length === 0}
            >
              {schoolYears.length === 0 ? (
                <MenuItem disabled>No hay años escolares creados</MenuItem>
              ) : (
                schoolYears.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name}
                  </MenuItem>
                ))
              )}
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  color="primary"
                />
              }
              label="Clase activa"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#888' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
              '&:hover': { opacity: 0.9 },
              textTransform: 'none'
            }}
          >
            {editingClass ? 'Actualizar' : 'Crear'}
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

export default AdminClasses