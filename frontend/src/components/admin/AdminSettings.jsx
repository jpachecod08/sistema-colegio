// components/admin/AdminSettings.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  Snackbar,
  Divider,
  CircularProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { 
  ArrowBack, 
  Save, 
  Settings, 
  School, 
  Add, 
  Edit, 
  Delete,
  CalendarToday,
  DateRange,
  CalendarMonth,
  CheckCircle,
  Scoreboard
} from '@mui/icons-material'
import api from '../../services/api'
import { useSettings } from '../../context/SettingsContext'

// Función para extraer datos de respuestas paginadas
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

// Componente para gestionar años escolares - Responsive
const SchoolYearsManager = ({ schoolYears, fetchSchoolYears, showMessage }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [openDialog, setOpenDialog] = useState(false)
  const [editingYear, setEditingYear] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false
  })
  const [error, setError] = useState('')

  const handleOpenDialog = (year = null) => {
    if (year) {
      setEditingYear(year)
      setFormData({
        name: year.name,
        start_date: year.start_date,
        end_date: year.end_date,
        is_active: year.is_active
      })
    } else {
      setEditingYear(null)
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingYear(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      setError('Todos los campos son requeridos')
      return
    }

    try {
      if (editingYear) {
        await api.put(`/academics/school-years/${editingYear.id}/`, formData)
        showMessage('Año escolar actualizado exitosamente', 'success')
      } else {
        await api.post('/academics/school-years/', formData)
        showMessage('Año escolar creado exitosamente', 'success')
      }
      handleCloseDialog()
      fetchSchoolYears()
    } catch (error) {
      console.error('Error saving school year:', error)
      const errorMsg = error.response?.data?.name?.[0] || 
                       error.response?.data?.detail || 
                       'Error al guardar el año escolar'
      setError(errorMsg)
    }
  }

  const handleDeleteYear = async (yearId) => {
    if (window.confirm('¿Estás seguro de eliminar este año escolar? Esto también eliminará las clases, matrículas y asignaciones relacionadas.')) {
      try {
        await api.delete(`/academics/school-years/${yearId}/`)
        showMessage('Año escolar eliminado exitosamente', 'success')
        fetchSchoolYears()
      } catch (error) {
        console.error('Error deleting school year:', error)
        showMessage('Error al eliminar el año escolar', 'error')
      }
    }
  }

  const handleSetActive = async (yearId) => {
    try {
      await api.post(`/academics/school-years/${yearId}/set-active/`)
      showMessage('Año escolar activado exitosamente', 'success')
      fetchSchoolYears()
    } catch (error) {
      console.error('Error setting active:', error)
      showMessage('Error al activar el año escolar', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: { xs: 16, sm: 18, md: 20 }
        }}>
          <School sx={{ fontSize: { xs: 18, sm: 20 } }} />
          Años Escolares
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="small"
          sx={{ 
            fontSize: { xs: 11, sm: 12 },
            px: { xs: 1.5, sm: 2 }
          }}
        >
          Nuevo Año Escolar
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px', 
          mb: 3,
          overflowX: 'auto'
        }}
      >
        <Table size="small" sx={{ minWidth: isMobile ? 500 : 'auto' }}>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Fecha Inicio</TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Fecha Fin</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schoolYears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 5} align="center">
                  <Typography sx={{ color: '#AAA', py: 2, fontSize: { xs: 12, sm: 13 } }}>
                    No hay años escolares registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              schoolYears.map((year) => (
                <TableRow key={year.id}>
                  <TableCell>
                    <Typography sx={{ 
                      fontWeight: 500, 
                      fontSize: { xs: 12, sm: 13 },
                      wordBreak: 'break-word'
                    }}>
                      {year.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {year.start_date}
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {year.end_date}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={year.is_active ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: year.is_active ? '#10B98120' : '#EF444420',
                        color: year.is_active ? '#10B981' : '#EF4444',
                        fontSize: { xs: 10, sm: 11 },
                        height: { xs: 24, sm: 32 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(year)}
                      sx={{ color: '#6C63FF', p: { xs: 0.5, sm: 0.75 } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {!year.is_active && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleSetActive(year.id)}
                        sx={{ color: '#10B981', p: { xs: 0.5, sm: 0.75 } }}
                        title="Activar año escolar"
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteYear(year.id)}
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
          fontSize: { xs: 18, sm: 20, md: 24 },
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 }
        }}>
          {editingYear ? 'Editar Año Escolar' : 'Nuevo Año Escolar'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              placeholder="Ej: 2024, 2025"
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <TextField
              label="Fecha de Inicio"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <TextField
              label="Fecha de Fin"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  color="primary"
                />
              }
              label="Activo (año escolar actual)"
              sx={{
                '& .MuiFormControlLabel-label': { fontSize: { xs: 12, sm: 13 } }
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
            {editingYear ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Componente para gestionar periodos académicos - Responsive
const PeriodsManager = ({ schoolYears, showMessage }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [periods, setPeriods] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    period_number: '',
    start_date: '',
    end_date: '',
    school_year: '',
    is_active: false
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (schoolYears.length > 0 && !selectedSchoolYear) {
      const activeYear = schoolYears.find(y => y.is_active) || schoolYears[0]
      if (activeYear) {
        setSelectedSchoolYear(activeYear.id)
      }
    }
  }, [schoolYears])

  useEffect(() => {
    if (selectedSchoolYear) {
      fetchPeriods()
    }
  }, [selectedSchoolYear])

  const fetchPeriods = async () => {
    if (!selectedSchoolYear) return
    setLoading(true)
    try {
      const response = await api.get(`/academics/academic-periods/?school_year=${selectedSchoolYear}`)
      const data = extractDataFromResponse(response)
      setPeriods(data)
    } catch (error) {
      console.error('Error fetching periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (period = null) => {
    if (period) {
      setEditingPeriod(period)
      setFormData({
        name: period.name,
        period_number: period.period_number,
        start_date: period.start_date,
        end_date: period.end_date,
        school_year: period.school_year,
        is_active: period.is_active
      })
    } else {
      setEditingPeriod(null)
      setFormData({
        name: '',
        period_number: '',
        start_date: '',
        end_date: '',
        school_year: selectedSchoolYear,
        is_active: false
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingPeriod(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.period_number || !formData.start_date || !formData.end_date) {
      setError('Todos los campos son requeridos')
      return
    }

    try {
      if (editingPeriod) {
        await api.put(`/academics/academic-periods/${editingPeriod.id}/`, formData)
        showMessage('Periodo actualizado exitosamente', 'success')
      } else {
        await api.post('/academics/academic-periods/', formData)
        showMessage('Periodo creado exitosamente', 'success')
      }
      handleCloseDialog()
      fetchPeriods()
    } catch (error) {
      console.error('Error saving period:', error)
      const errorMsg = error.response?.data?.name?.[0] || 
                       error.response?.data?.period_number?.[0] ||
                       error.response?.data?.detail || 
                       'Error al guardar el periodo'
      setError(errorMsg)
    }
  }

  const handleDeletePeriod = async (periodId) => {
    if (window.confirm('¿Estás seguro de eliminar este periodo? Esto afectará las actividades relacionadas.')) {
      try {
        await api.delete(`/academics/academic-periods/${periodId}/`)
        showMessage('Periodo eliminado exitosamente', 'success')
        fetchPeriods()
      } catch (error) {
        console.error('Error deleting period:', error)
        showMessage('Error al eliminar el periodo', 'error')
      }
    }
  }

  const handleSetActive = async (periodId) => {
    try {
      await api.post(`/academics/academic-periods/${periodId}/set-active/`)
      showMessage('Periodo activado exitosamente', 'success')
      fetchPeriods()
    } catch (error) {
      console.error('Error setting active:', error)
      showMessage('Error al activar el periodo', 'error')
    }
  }

  const currentSchoolYear = schoolYears.find(y => y.id === selectedSchoolYear)

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: { xs: 16, sm: 18, md: 20 }
        }}>
          <CalendarMonth sx={{ fontSize: { xs: 18, sm: 20 } }} />
          Periodos Académicos
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="small"
          sx={{ 
            fontSize: { xs: 11, sm: 12 },
            px: { xs: 1.5, sm: 2 }
          }}
        >
          Nuevo Periodo
        </Button>
      </Box>

      <FormControl 
        size="small" 
        sx={{ 
          minWidth: { xs: '100%', sm: 200 }, 
          mb: 2 
        }}
      >
        <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Año Escolar</InputLabel>
        <Select
          value={selectedSchoolYear}
          onChange={(e) => setSelectedSchoolYear(e.target.value)}
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

      {currentSchoolYear && (
        <Typography variant="body2" sx={{ 
          color: '#AAA', 
          mb: 2,
          fontSize: { xs: 11, sm: 12 }
        }}>
          Gestionando periodos para {currentSchoolYear.name}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : periods.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2, borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
          No hay periodos académicos configurados para este año escolar. 
          Haz clic en "Nuevo Periodo" para crear uno.
        </Alert>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '12px',
            overflowX: 'auto'
          }}
        >
          <Table size="small" sx={{ minWidth: isMobile ? 600 : 'auto' }}>
            <TableHead>
              <TableRow sx={{ background: '#F5F3EE' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Fecha Inicio</TableCell>
                {!isMobile && (
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Fecha Fin</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>
                    <Typography sx={{ 
                      fontWeight: 500, 
                      fontSize: { xs: 12, sm: 13 },
                      wordBreak: 'break-word'
                    }}>
                      {period.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {period.period_number}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {period.start_date}
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {period.end_date}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={period.is_active ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: period.is_active ? '#10B98120' : '#EF444420',
                        color: period.is_active ? '#10B981' : '#EF4444',
                        fontSize: { xs: 10, sm: 11 },
                        height: { xs: 24, sm: 32 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(period)}
                      sx={{ color: '#6C63FF', p: { xs: 0.5, sm: 0.75 } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {!period.is_active && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleSetActive(period.id)}
                        sx={{ color: '#10B981', p: { xs: 0.5, sm: 0.75 } }}
                        title="Activar periodo"
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeletePeriod(period.id)}
                      sx={{ color: '#EF4444', p: { xs: 0.5, sm: 0.75 } }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
          fontSize: { xs: 18, sm: 20, md: 24 },
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 }
        }}>
          {editingPeriod ? 'Editar Periodo Académico' : 'Nuevo Periodo Académico'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              placeholder="Ej: Periodo 1, I Trimestre, etc."
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <TextField
              label="Número de Periodo"
              name="period_number"
              type="number"
              value={formData.period_number}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              inputProps={{ min: 1, max: 4 }}
              placeholder="1, 2, 3 o 4"
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <TextField
              label="Fecha de Inicio"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <TextField
              label="Fecha de Fin"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  color="primary"
                />
              }
              label="Periodo activo (actual)"
              sx={{
                '& .MuiFormControlLabel-label': { fontSize: { xs: 12, sm: 13 } }
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
            {editingPeriod ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Componente principal de configuración - Responsive
const AdminSettings = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const { settings: contextSettings, updateSettings, loading: settingsLoading } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [schoolYears, setSchoolYears] = useState([])
  const [localSettings, setLocalSettings] = useState(contextSettings)

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message)
    } else {
      setError(message)
    }
  }

  useEffect(() => {
    setLocalSettings(contextSettings)
  }, [contextSettings])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchSchoolYears()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchoolYears = async () => {
    try {
      const response = await api.get('/academics/school-years/')
      const data = extractDataFromResponse(response)
      setSchoolYears(data)
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }

  const handleSettingChange = (e) => {
    setLocalSettings({
      ...localSettings,
      [e.target.name]: e.target.value
    })
  }

  const handleSwitchChange = (e) => {
    setLocalSettings({
      ...localSettings,
      [e.target.name]: e.target.checked
    })
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setError('')
    const result = await updateSettings(localSettings)
    if (result.success) {
      setSuccess('Configuración guardada exitosamente')
    } else {
      setError(result.error || 'Error al guardar la configuración')
    }
    setSaving(false)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const getMaxScore = () => {
    switch (localSettings.grading_scale) {
      case '10': return 10
      case '5': return 5
      default: return 100
    }
  }

  if (loading || settingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 2, md: 3 },
      maxWidth: { xs: '100%', sm: '95%', md: 1000 },
      width: '100%',
      mx: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header Responsive */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 2, sm: 2 },
        mb: { xs: 2, sm: 3 }
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
          Configuración del Sistema
        </Typography>
      </Box>

      <Paper sx={{ 
        borderRadius: '14px', 
        border: '0.5px solid #E0DDD8', 
        overflow: 'hidden' 
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ 
            borderBottom: '1px solid #E0DDD8', 
            px: { xs: 1, sm: 2 },
            '& .MuiTab-root': {
              fontSize: { xs: 12, sm: 13 },
              minWidth: { xs: 'auto', sm: 100 },
              px: { xs: 1.5, sm: 2 }
            }
          }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab icon={<Settings />} label="General" />
          <Tab icon={<School />} label="Años" />
          <Tab icon={<CalendarMonth />} label="Periodos" />
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')} 
              sx={{ mb: 2, borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}
            >
              {error}
            </Alert>
          )}

          {/* Pestaña General - Responsive */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: 16, sm: 18, md: 20 }
              }}>
                <Settings sx={{ fontSize: { xs: 18, sm: 20 } }} />
                Información Institucional
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nombre de la Institución"
                  name="school_name"
                  value={localSettings.school_name}
                  onChange={handleSettingChange}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                  }}
                />
                
                <TextField
                  label="Dirección"
                  name="school_address"
                  value={localSettings.school_address}
                  onChange={handleSettingChange}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                  }}
                />
                
                <TextField
                  label="Teléfono"
                  name="school_phone"
                  value={localSettings.school_phone}
                  onChange={handleSettingChange}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                  }}
                />
                
                <TextField
                  label="Email Institucional"
                  name="school_email"
                  value={localSettings.school_email}
                  onChange={handleSettingChange}
                  fullWidth
                  size="small"
                  type="email"
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ 
                mb: 2,
                fontSize: { xs: 16, sm: 18, md: 20 }
              }}>
                Permisos del Sistema
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.allow_registration}
                      onChange={handleSwitchChange}
                      name="allow_registration"
                    />
                  }
                  label="Permitir registro de nuevos usuarios"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: { xs: 12, sm: 13 } }
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.allow_grade_editing}
                      onChange={handleSwitchChange}
                      name="allow_grade_editing"
                    />
                  }
                  label="Permitir edición de calificaciones"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: { xs: 12, sm: 13 } }
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: 16, sm: 18, md: 20 }
              }}>
                <Scoreboard sx={{ fontSize: { xs: 18, sm: 20 } }} />
                Configuración Académica
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Escala de Calificación</InputLabel>
                  <Select
                    name="grading_scale"
                    value={localSettings.grading_scale || '100'}
                    onChange={handleSettingChange}
                    label="Escala de Calificación"
                    sx={{ fontSize: { xs: 12, sm: 13 } }}
                  >
                    <MenuItem value="100" sx={{ fontSize: { xs: 12, sm: 13 } }}>0 - 100 (Mínimo 60 para aprobar)</MenuItem>
                    <MenuItem value="10" sx={{ fontSize: { xs: 12, sm: 13 } }}>1 - 10 (Mínimo 6.0 para aprobar)</MenuItem>
                    <MenuItem value="5" sx={{ fontSize: { xs: 12, sm: 13 } }}>1 - 5 (Mínimo 3.0 para aprobar)</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Nota Mínima para Aprobar"
                  name="min_grade"
                  type="number"
                  value={localSettings.min_grade || 60}
                  onChange={handleSettingChange}
                  fullWidth
                  size="small"
                  helperText={`Calificación mínima para considerar aprobado según la escala ${localSettings.grading_scale === '100' ? '0-100' : localSettings.grading_scale === '10' ? '1-10' : '1-5'}`}
                  inputProps={{ 
                    step: "0.1",
                    min: 0,
                    max: getMaxScore()
                  }}
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiFormHelperText-root': { fontSize: { xs: 10, sm: 11 } }
                  }}
                />

                <Alert severity="info" sx={{ mt: 1, borderRadius: '10px' }}>
                  <Typography variant="body2" sx={{ fontSize: { xs: 11, sm: 12 } }}>
                    <strong>Nota máxima:</strong> {getMaxScore()} puntos<br/>
                    <strong>Nota mínima aprobatoria:</strong> {localSettings.min_grade || 60} puntos
                  </Typography>
                </Alert>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'center', sm: 'flex-end' }, 
                mt: 3 
              }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  startIcon={<Save />}
                  sx={{
                    background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
                    '&:hover': { opacity: 0.9 },
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontSize: { xs: 12, sm: 13 },
                    px: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Pestaña Años Escolares */}
          {tabValue === 1 && (
            <SchoolYearsManager 
              schoolYears={schoolYears}
              fetchSchoolYears={fetchSchoolYears}
              showMessage={showMessage}
            />
          )}

          {/* Pestaña Periodos Académicos */}
          {tabValue === 2 && (
            <PeriodsManager 
              schoolYears={schoolYears}
              showMessage={showMessage}
            />
          )}
        </Box>
      </Paper>

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

export default AdminSettings