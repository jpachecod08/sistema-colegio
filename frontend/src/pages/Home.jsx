import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import Navbar from '../components/Layout/Navbar'
import Sidebar from '../components/Layout/Sidebar'
import Footer from '../components/Layout/Footer'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  // Estado para controlar el sidebar en móvil
  const [mobileOpen, setMobileOpen] = useState(false)
  // Estado para controlar si el sidebar está colapsado en desktop
  const [isCollapsed, setIsCollapsed] = useState(false)

  console.log('=== HOME RENDER ===')
  console.log('User en Home:', user)
  console.log('Rol en Home:', user?.role)

  // Definir anchos del sidebar
  const drawerWidth = 280
  const miniDrawerWidth = 72
  
  // Calcular el ancho actual del sidebar
  const currentDrawerWidth = isCollapsed && !isMobile && !isTablet ? miniDrawerWidth : drawerWidth

  if (!user) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Pasar la función onMenuClick al Navbar */}
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar 
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          isCollapsed={isCollapsed}
          onCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            // Ajustar el margen izquierdo según el dispositivo y estado del sidebar
            ml: { 
              xs: 0, // En móvil, sin margen porque el sidebar está oculto
              sm: isCollapsed && !isTablet ? `${miniDrawerWidth}px` : `${drawerWidth}px`,
              md: isCollapsed ? `${miniDrawerWidth}px` : `${drawerWidth}px`
            },
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            width: { 
              xs: '100%',
              sm: `calc(100% - ${currentDrawerWidth}px)`
            },
            mt: { xs: 6, sm: 0 }, // Espacio para el navbar fijo
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Toolbar /> {/* Toolbar para compensar el Navbar fijo */}
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}

export default Home