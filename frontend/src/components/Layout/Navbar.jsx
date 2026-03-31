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
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Notifications,
  School,
  Person,
  Logout,
  Dashboard,
  Menu as MenuIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
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

  // Obtener el nombre del usuario (nombre real o username)
  const getUserName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.first_name) {
      return user.first_name
    }
    return user?.username || 'Usuario'
  }

  const getShortUserName = () => {
    const fullName = getUserName()
    if (fullName.length > 12) {
      return fullName.substring(0, 10) + '...'
    }
    return fullName
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase()
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

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin': return '/admin'
      case 'teacher': return '/teacher'
      case 'student': return '/student'
      case 'parent': return '/parent'
      default: return '/'
    }
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Botón de menú hamburguesa - solo visible en móvil */}
        {isMobile && onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <School sx={{ 
          mr: { xs: 1, sm: 2 }, 
          fontSize: { xs: 24, sm: 28 } 
        }} />
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} 
          onClick={() => navigate(getDashboardPath())}
        >
          Sistema Académico
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }
        }}>
          {/* Notificaciones - ocultar en móvil */}
          {!isMobile && (
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" onClick={handleNotifications}>
                <Badge badgeContent={3} color="error">
                  <Notifications sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          {/* Dashboard - ocultar en móvil */}
          {!isMobile && (
            <Tooltip title="Dashboard">
              <IconButton color="inherit" onClick={() => navigate(getDashboardPath())}>
                <Dashboard sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
            </Tooltip>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 }
          }}>
            {/* Chip de rol - SIEMPRE se muestra */}
            <Chip
              label={getRoleName()}
              color={getRoleColor()}
              size="small"
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: 10, sm: 11, md: 12 },
                height: { xs: 24, sm: 28 },
                '& .MuiChip-label': { 
                  px: { xs: 1, sm: 1.5 }
                }
              }}
            />
            
            {/* Nombre del usuario - solo en desktop/tablet, en móvil se muestra en el avatar */}
            {!isMobile && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: { xs: 12, sm: 13, md: 14 },
                  maxWidth: { xs: 120, sm: 150, md: 200 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {getUserName()}
              </Typography>
            )}
            
            <Tooltip title={isMobile ? getUserName() : "Perfil"}>
              <IconButton onClick={handleMenu} size="small">
                <Avatar sx={{ 
                  bgcolor: 'secondary.main', 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 },
                  fontSize: { xs: 12, sm: 14 }
                }}>
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
              <Person sx={{ mr: 1, fontSize: 20 }} /> 
              <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>
                Mi Perfil
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1, fontSize: 20 }} /> 
              <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>
                Cerrar Sesión
              </Typography>
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{ fontSize: { xs: 12, sm: 13 } }}>
              No tienes notificaciones
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar