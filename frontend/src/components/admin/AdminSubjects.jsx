// components/admin/AdminSubjects.jsx
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
  CircularProgress
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack, School } from '@mui/icons-material'
import api from '../../services/api'

const AdminSubjects = () => {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
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
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/academics/subjects/')
      const data = extractDataFromResponse(response)
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setError('Error al cargar las materias')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setEditingSubject(subject)
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description || ''
      })
    } else {
      setEditingSubject(null)
      setFormData({
        name: '',
        code: '',
        description: ''
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSubject(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      setError('Nombre y código son requeridos')
      return
    }

    try {
      if (editingSubject) {
        await api.put(`/academics/subjects/${editingSubject.id}/`, formData)
        setSuccess('Materia actualizada exitosamente')
      } else {
        await api.post('/academics/subjects/', formData)
        setSuccess('Materia creada exitosamente')
      }
      handleCloseDialog()
      fetchSubjects()
    } catch (error) {
      console.error('Error saving subject:', error)
      const errorMsg = error.response?.data?.code?.[0] || 
                       error.response?.data?.name?.[0] ||
                       error.response?.data?.detail || 
                       'Error al guardar la materia'
      setError(errorMsg)
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('¿Estás seguro de eliminar esta materia?')) {
      try {
        await api.delete(`/academics/subjects/${subjectId}/`)
        setSuccess('Materia eliminada exitosamente')
        fetchSubjects()
      } catch (error) {
        console.error('Error deleting subject:', error)
        setError('Error al eliminar la materia')
      }
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
            Gestión de Materias
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
          Nueva Materia
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <School sx={{ fontSize: 48, color: '#CCC', mb: 1 }} />
                    <Typography sx={{ color: '#AAA' }}>
                      No hay materias registradas
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      Crear primera materia
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id} hover>
                  <TableCell>
                    <Chip
                      label={subject.code}
                      size="small"
                      sx={{ backgroundColor: '#6C63FF20', color: '#6C63FF', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{subject.name}</Typography>
                  </TableCell>
                  <TableCell>{subject.description || '—'}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(subject)}
                      sx={{ color: '#6C63FF' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteSubject(subject.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 24 }}>
          {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px' }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Código"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              placeholder="Ej: MAT101, LENG01"
              helperText="Código único para la materia"
            />
            
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              placeholder="Ej: Matemáticas, Lengua Castellana"
            />
            
            <TextField
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="Descripción opcional de la materia"
            />
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
            {editingSubject ? 'Actualizar' : 'Crear'}
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

export default AdminSubjects