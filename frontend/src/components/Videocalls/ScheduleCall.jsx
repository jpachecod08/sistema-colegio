import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Alert
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import { videocallService } from '../../services/videocalls'
import { useAuth } from '../../context/AuthContext'

const ScheduleCall = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    call_type: 'private',
    scheduled_time: new Date(),
    duration_minutes: 30,
    max_participants: 50,
    recording_enabled: false,
    grade: null,
    teacher_assignment: null
  })
  const [availableParticipants, setAvailableParticipants] = useState([])
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (open) {
      loadParticipants()
    }
  }, [open])
  
  const loadParticipants = async () => {
    try {
      const participants = await videocallService.getAvailableParticipants()
      setAvailableParticipants(participants)
    } catch (error) {
      console.error('Error al cargar participantes:', error)
    }
  }
  
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    try {
      const call = await videocallService.createCall(formData)
      
      // Invitar participantes seleccionados
      if (selectedParticipants.length > 0) {
        await videocallService.inviteParticipants(call.id, selectedParticipants)
      }
      
      onSuccess && onSuccess()
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al programar la videollamada')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Programar Videollamada</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          label="Título"
          margin="normal"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        
        <TextField
          fullWidth
          label="Descripción"
          margin="normal"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Llamada</InputLabel>
          <Select
            value={formData.call_type}
            onChange={(e) => handleChange('call_type', e.target.value)}
          >
            <MenuItem value="private">Privada</MenuItem>
            <MenuItem value="class">Clase</MenuItem>
            <MenuItem value="parent_meeting">Reunión de Padres</MenuItem>
          </Select>
        </FormControl>
        
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
          <DateTimePicker
            label="Fecha y Hora"
            value={formData.scheduled_time}
            onChange={(newValue) => handleChange('scheduled_time', newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </LocalizationProvider>
        
        <TextField
          fullWidth
          label="Duración (minutos)"
          type="number"
          margin="normal"
          value={formData.duration_minutes}
          onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
        />
        
        <TextField
          fullWidth
          label="Máximo de Participantes"
          type="number"
          margin="normal"
          value={formData.max_participants}
          onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.recording_enabled}
              onChange={(e) => handleChange('recording_enabled', e.target.checked)}
            />
          }
          label="Grabar videollamada"
        />
        
        {user.role !== 'student' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Invitar Participantes</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Seleccionar Participantes</InputLabel>
              <Select
                multiple
                value={selectedParticipants}
                onChange={(e) => setSelectedParticipants(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const participant = availableParticipants.find(p => p.id === value)
                      return <Chip key={value} label={participant?.full_name} />
                    })}
                  </Box>
                )}
              >
                {availableParticipants.map((participant) => (
                  <MenuItem key={participant.id} value={participant.id}>
                    {participant.full_name} - {participant.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Programando...' : 'Programar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScheduleCall