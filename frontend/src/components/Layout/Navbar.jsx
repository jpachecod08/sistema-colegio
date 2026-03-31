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

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
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
          {/* Notificaciones - ocultar en móvil muy pequeño */}
          {!isMobile && (
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" onClick={handleNotifications}>
                <Badge badgeContent={3} color="error">
                  <Notifications sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          {/* Dashboard - ocultar en móvil muy pequeño */}
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
            {/* Chip de rol - ocultar texto en móvil muy pequeño */}
            {!isMobile ? (
              <Chip
                label={getRoleName()}
                color={getRoleColor()}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: 11, sm: 12 }
                }}
              />
            ) : (
              <Chip
                label={getRoleName().charAt(0)}
                color={getRoleColor()}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  minWidth: 32,
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
            
            <Tooltip title="Perfil">
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