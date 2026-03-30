import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Toolbar } from '@mui/material'
import Navbar from '../components/Layout/Navbar'
import Sidebar from '../components/Layout/Sidebar'
import Footer from '../components/Layout/Footer'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  console.log('=== HOME RENDER ===')
  console.log('User en Home:', user)
  console.log('Rol en Home:', user?.role)

  if (!user) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}

export default Home