// components/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { ArrowBack, PictureAsPdf, Download, Assessment } from '@mui/icons-material'
import api from '../../services/api'

const AdminReports = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')

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
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/academics/grades/')
      const data = extractDataFromResponse(response)
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type) => {
    setGenerating(true)
    setError('')
    try {
      let url = ''
      switch(type) {
        case 'general':
          url = '/reports/general/'
          break
        case 'grades':
          url = '/reports/grades/'
          if (selectedClass) url += `?grade=${selectedClass}`
          if (selectedPeriod) url += `${selectedClass ? '&' : '?'}period=${selectedPeriod}`
          break
        case 'attendance':
          url = '/reports/attendance/'
          if (selectedClass) url += `?grade=${selectedClass}`
          break
        default:
          url = '/reports/'
      }
      
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const urlBlob = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlBlob
      link.download = `reporte_${type}_${new Date().toISOString().slice(0,10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlBlob)
      setSuccess(`Reporte ${type} generado exitosamente`)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Error al generar el reporte')
    } finally {
      setGenerating(false)
    }
  }

  const reports = [
    {
      id: 'general',
      title: 'Reporte General',
      description: 'Estadísticas generales del sistema',
      icon: <Assessment sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />,
      color: '#6C63FF',
      hasFilters: false
    },
    {
      id: 'grades',
      title: 'Reporte de Calificaciones',
      description: 'Calificaciones por clase y periodo',
      icon: <Assessment sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />,
      color: '#4ECDC4',
      hasFilters: true
    },
    {
      id: 'attendance',
      title: 'Reporte de Asistencia',
      description: 'Asistencia por clase',
      icon: <Assessment sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />,
      color: '#F59E0B',
      hasFilters: true
    },
    {
      id: 'students',
      title: 'Listado de Estudiantes',
      description: 'Lista completa de estudiantes',
      icon: <Assessment sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />,
      color: '#10B981',
      hasFilters: false
    }
  ]

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
          Generación de Reportes
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')} 
          sx={{ 
            mb: 2, 
            borderRadius: '10px', 
            fontSize: { xs: 12, sm: 13 } 
          }}
        >
          {error}
        </Alert>
      )}

      {/* Filtros Responsive */}
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: { xs: 2, sm: 3 }, 
        borderRadius: '14px', 
        border: '0.5px solid #E0DDD8' 
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontSize: { xs: 16, sm: 18, md: 20 } 
        }}>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Clase/Grado</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Clase/Grado"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                <MenuItem value="" sx={{ fontSize: { xs: 12, sm: 13 } }}>Todas</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id} sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: { xs: 12, sm: 13 } }}>Periodo</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                label="Periodo"
                sx={{ fontSize: { xs: 12, sm: 13 } }}
              >
                <MenuItem value="" sx={{ fontSize: { xs: 12, sm: 13 } }}>Todos</MenuItem>
                <MenuItem value="1" sx={{ fontSize: { xs: 12, sm: 13 } }}>Periodo 1</MenuItem>
                <MenuItem value="2" sx={{ fontSize: { xs: 12, sm: 13 } }}>Periodo 2</MenuItem>
                <MenuItem value="3" sx={{ fontSize: { xs: 12, sm: 13 } }}>Periodo 3</MenuItem>
                <MenuItem value="4" sx={{ fontSize: { xs: 12, sm: 13 } }}>Periodo 4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid de reportes Responsive */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {reports.map((report) => (
          <Grid item xs={12} sm={6} md={3} key={report.id}>
            <Card sx={{ 
              borderRadius: '14px', 
              border: '0.5px solid #E0DDD8',
              transition: 'transform 0.2s, box-shadow 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-4px)' },
                boxShadow: { sm: '0 8px 24px rgba(0,0,0,0.1)' }
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 2, sm: 2.5, md: 3 },
                flex: 1
              }}>
                <Box sx={{ color: report.color, mb: 2 }}>
                  {report.icon}
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 500, 
                  fontSize: { xs: 16, sm: 18, md: 20 } 
                }}>
                  {report.title}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#888', 
                  mt: 1,
                  fontSize: { xs: 11, sm: 12, md: 13 }
                }}>
                  {report.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: { xs: 2, sm: 2.5 } }}>
                <Button
                  variant="contained"
                  startIcon={<Download sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  onClick={() => generateReport(report.id)}
                  disabled={generating}
                  sx={{
                    background: `linear-gradient(135deg, ${report.color} 0%, ${report.color}CC 100%)`,
                    '&:hover': { opacity: 0.9 },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 0.5, sm: 0.75 }
                  }}
                >
                  {generating ? 'Generando...' : 'Generar PDF'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default AdminReports