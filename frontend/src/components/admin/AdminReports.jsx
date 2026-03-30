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
  InputLabel
} from '@mui/material'
import { ArrowBack, PictureAsPdf, Download, Assessment } from '@mui/icons-material'
import api from '../../services/api'

const AdminReports = () => {
  const navigate = useNavigate()
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
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#6C63FF',
      hasFilters: false
    },
    {
      id: 'grades',
      title: 'Reporte de Calificaciones',
      description: 'Calificaciones por clase y periodo',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#4ECDC4',
      hasFilters: true
    },
    {
      id: 'attendance',
      title: 'Reporte de Asistencia',
      description: 'Asistencia por clase',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      hasFilters: true
    },
    {
      id: 'students',
      title: 'Listado de Estudiantes',
      description: 'Lista completa de estudiantes',
      icon: <Assessment sx={{ fontSize: 40 }} />,
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          startIcon={<ArrowBack />}
          sx={{ borderRadius: '8px' }}
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontFamily: '"Instrument Serif", serif' }}>
          Generación de Reportes
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* Filtros para reportes que los requieren */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Clase/Grado</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Clase/Grado"
              >
                <MenuItem value="">Todas</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Periodo</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                label="Periodo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">Periodo 1</MenuItem>
                <MenuItem value="2">Periodo 2</MenuItem>
                <MenuItem value="3">Periodo 3</MenuItem>
                <MenuItem value="4">Periodo 4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid de reportes */}
      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} sm={6} md={3} key={report.id}>
            <Card sx={{ 
              borderRadius: '14px', 
              border: '0.5px solid #E0DDD8',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ color: report.color, mb: 2 }}>
                  {report.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {report.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
                  {report.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => generateReport(report.id)}
                  disabled={generating}
                  sx={{
                    background: `linear-gradient(135deg, ${report.color} 0%, ${report.color}CC 100%)`,
                    '&:hover': { opacity: 0.9 },
                    borderRadius: '8px',
                    textTransform: 'none'
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
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: '10px' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminReports