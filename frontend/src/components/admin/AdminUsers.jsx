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
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const AdminUsers = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
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
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/list/')
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
      fetchUsers()
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
        fetchUsers()
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
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: '"Instrument Serif", serif',
            fontSize: { xs: 20, sm: 28, md: 32 }
          }}
        >
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
            textTransform: 'none',
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: 12, sm: 13 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Tabla de usuarios - Responsive con scroll horizontal */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '14px', 
          border: '0.5px solid #E0DDD8',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
          <TableHead>
            <TableRow sx={{ background: '#F5F3EE' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Usuario</TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Nombre</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 5 : 6} align="center">
                  <Box sx={{ py: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                    <Typography sx={{ color: '#AAA', fontSize: { xs: 12, sm: 13 } }}>
                      No hay usuarios registrados
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2, fontSize: { xs: 11, sm: 12 } }}
                    >
                      Crear primer usuario
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              users.map((userItem) => (
                <TableRow key={userItem.id} hover>
                  <TableCell>
                    <Typography sx={{ 
                      fontWeight: 500, 
                      fontSize: { xs: 12, sm: 13 },
                      wordBreak: 'break-word'
                    }}>
                      {userItem.username}
                    </Typography>
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                      {`${userItem.first_name || ''} ${userItem.last_name || ''}`.trim() || '—'}
                    </TableCell>
                  )}
                  <TableCell sx={{ fontSize: { xs: 11, sm: 12 }, wordBreak: 'break-word' }}>
                    {userItem.email}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(userItem.role)}
                      sx={{
                        backgroundColor: `${getRoleColor(userItem.role)}20`,
                        color: getRoleColor(userItem.role),
                        fontWeight: 500,
                        fontSize: { xs: 10, sm: 12 },
                        height: { xs: 24, sm: 32 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userItem.is_active !== false ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: userItem.is_active !== false ? '#10B98120' : '#EF444420',
                        color: userItem.is_active !== false ? '#10B981' : '#EF4444',
                        fontSize: { xs: 10, sm: 12 },
                        height: { xs: 24, sm: 32 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(userItem)}
                      sx={{ color: '#6C63FF', p: { xs: 0.5, sm: 0.75 } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteUser(userItem.id)}
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

      {/* Dialog Responsive para crear/editar usuario */}
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
          {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px', fontSize: { xs: 12, sm: 13 } }}>
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
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
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
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2 
            }}>
              <TextField
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                  '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                }}
              />
              <TextField
                label="Apellido"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                  '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                }}
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
              sx={{
                '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
              }}
            >
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value} sx={{ fontSize: { xs: 12, sm: 13 } }}>
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
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                  }}
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
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                    '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                  }}
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
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: 12, sm: 13 } },
                  '& .MuiInputBase-root': { fontSize: { xs: 12, sm: 13 } }
                }}
              >
                <MenuItem value={true} sx={{ fontSize: { xs: 12, sm: 13 } }}>Activo</MenuItem>
                <MenuItem value={false} sx={{ fontSize: { xs: 12, sm: 13 } }}>Inactivo</MenuItem>
              </TextField>
            )}
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
              textTransform: 'none',
              fontSize: { xs: 12, sm: 13 },
              px: { xs: 2, sm: 3 }
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

export default AdminUsers