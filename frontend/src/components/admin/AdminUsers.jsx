// components/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react'
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
  CircularProgress
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const AdminUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    is_active: true
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const ROLES = [
    { value: 'admin', label: 'Administrador', color: '#EF4444' },
    { value: 'teacher', label: 'Profesor', color: '#6C63FF' },
    { value: 'student', label: 'Estudiante', color: '#4ECDC4' },
    { value: 'parent', label: 'Acudiente', color: '#F59E0B' }
  ]

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

  // Cargar usuarios
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/list/')  // ← Cambiado a /users/list/
      const data = extractDataFromResponse(response)
      setUsers(data)
      console.log('Usuarios cargados:', data.length)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (userItem = null) => {
    if (userItem) {
      setEditingUser(userItem)
      setFormData({
        username: userItem.username,
        email: userItem.email,
        password: '',
        confirm_password: '',
        first_name: userItem.first_name || '',
        last_name: userItem.last_name || '',
        role: userItem.role,
        is_active: userItem.is_active !== false
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        role: 'student',
        is_active: true
      })
    }
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.email) {
      setError('Usuario y email son requeridos')
      return
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!editingUser && formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      if (editingUser) {
        // Actualizar usuario
        await api.put(`/users/${editingUser.id}/`, {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          is_active: formData.is_active
        })
        setSuccess('Usuario actualizado exitosamente')
      } else {
        // Crear usuario
        await api.post('/users/register/', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role
        })
        setSuccess('Usuario creado exitosamente')
      }
      handleCloseDialog()
      fetchUsers()  // Recargar la lista después de crear/actualizar
    } catch (error) {
      console.error('Error saving user:', error)
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.username?.[0] ||
                      error.response?.data?.email?.[0] ||
                      'Error al guardar usuario'
      setError(errorMsg)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/users/${userId}/`)
        setSuccess('Usuario eliminado exitosamente')
        fetchUsers()  // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error deleting user:', error)
        setError('Error al eliminar usuario')
      }
    }
  }

  const getRoleColor = (role) => {
    const roleInfo = ROLES.find(r => r.value === role)
    return roleInfo?.color || '#888'
  }

  const getRoleLabel = (role) => {
    const roleInfo = ROLES.find(r => r.value === role)
    return roleInfo?.label || role
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
        <Typography variant="h4" sx={{ fontFamily: '"Instrument Serif", serif' }}>
          Gestión de Usuarios
        </Typography>
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
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '0.5px solid #E0DDD8' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ color: '#AAA' }}>
                      No hay usuarios registrados
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      Crear primer usuario
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              users.map((userItem) => (
                <TableRow key={userItem.id} hover>
                  <TableCell>{userItem.username}</TableCell>
                  <TableCell>{`${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || '—'}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(userItem.role)}
                      sx={{
                        backgroundColor: `${getRoleColor(userItem.role)}20`,
                        color: getRoleColor(userItem.role),
                        fontWeight: 500,
                        fontSize: 12
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userItem.is_active !== false ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: userItem.is_active !== false ? '#10B98120' : '#EF444420',
                        color: userItem.is_active !== false ? '#10B981' : '#EF4444',
                        fontSize: 12
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(userItem)}
                      sx={{ color: '#6C63FF' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteUser(userItem.id)}
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

      {/* Dialog para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 24 }}>
          {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px' }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Nombre de usuario"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
              size="small"
            />
            
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              size="small"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                size="small"
              />
              <TextField
                label="Apellido"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Box>
            
            <TextField
              select
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: role.color }} />
                    {role.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            
            {!editingUser && (
              <>
                <TextField
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Confirmar contraseña"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                />
              </>
            )}
            
            {editingUser && (
              <TextField
                select
                label="Estado"
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </TextField>
            )}
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
            {editingUser ? 'Actualizar' : 'Crear'}
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

export default AdminUsers