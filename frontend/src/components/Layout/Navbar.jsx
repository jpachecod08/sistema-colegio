import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Badge,
  Tooltip,
  Chip
} from '@mui/material'
import {
  Notifications,
  School,
  Person,
  Logout,
  Dashboard
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'error'
      case 'teacher': return 'primary'
      case 'student': return 'success'
      case 'parent': return 'warning'
      default: return 'default'
    }
  }

  const getRoleName = () => {
    switch (user?.role) {
      case 'admin': return 'Administrador'
      case 'teacher': return 'Profesor'
      case 'student': return 'Estudiante'
      case 'parent': return 'Acudiente'
      default: return user?.role
    }
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    return user?.username?.[0]?.toUpperCase() || 'U'
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleClose()
  }

  const handleNotifications = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <School sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          Sistema Académico
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Notificaciones">
            <IconButton color="inherit" onClick={handleNotifications}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Dashboard">
            <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
              <Dashboard />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={getRoleName()}
              color={getRoleColor()}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            
            <Tooltip title="Perfil">
              <IconButton onClick={handleMenu} size="small">
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  {getInitials()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleClose() }}>
              <Person sx={{ mr: 1 }} /> Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Cerrar Sesión
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>No tienes notificaciones</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar