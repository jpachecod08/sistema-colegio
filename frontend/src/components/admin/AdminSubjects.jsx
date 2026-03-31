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
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack, School } from '@mui/icons-material'
import api from '../../services/api'

const AdminSubjects = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
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
            textTransform: 'none',
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: 12, sm: 13 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Nueva Materia
        </Button>
      </Box>

      {/* Tabla de materias - Responsive con scroll horizontal */}
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
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Nombre</TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Descripción</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : 4} align="center">
                  <Box sx={{ py: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                    <School sx={{ fontSize: { xs: 36, sm: 48 }, color: '#CCC', mb: 1 }} />
                    <Typography sx={{ color: '#AAA', fontSize: { xs: 12, sm: 13 } }}>
                      No hay materias registradas
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2, fontSize: { xs: 11, sm: 12 } }}
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
                      sx={{ 
                        backgroundColor: '#6C63FF20', 
                        color: '#6C63FF', 
                        fontWeight: 500,
                        fontSize: { xs: 10, sm: 11 },
                        height: { xs: 24, sm: 32 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ 
                      fontWeight: 500, 
                      fontSize: { xs: 12, sm: 13 },
                      wordBreak: 'break-word'
                    }}>
                      {subject.name}
                    </Typography>
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {subject.description || '—'}
                    </TableCell>
                  )}
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(subject)}
                      sx={{ color: '#6C63FF', p: { xs: 0.5, sm: 0.75 } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteSubject(subject.id)}
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
          {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
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
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiFormHelperText-root': { fontSize: { xs: 10, sm: 11 } }
              }}
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
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
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
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
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
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')} 
          sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminSubjects