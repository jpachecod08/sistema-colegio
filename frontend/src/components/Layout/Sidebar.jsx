import React, { useState } from 'react'
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, Box, 
  Toolbar, Divider, Collapse, useTheme, useMediaQuery 
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GradeIcon from '@mui/icons-material/Grade'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import ClassIcon from '@mui/icons-material/Class'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SettingsIcon from '@mui/icons-material/Settings'
import BarChartIcon from '@mui/icons-material/BarChart'
import DescriptionIcon from '@mui/icons-material/Description'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useAuth } from '../../context/AuthContext'

const drawerWidth = 280

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [openSections, setOpenSections] = useState({
    principal: true,
    gestion: true,
    academicos: true,
    reportes: true,
    sistema: true
  })

  const handleSectionClick = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return {
        sections: [
          {
            id: 'principal',
            title: 'PRINCIPAL',
            icon: <DashboardIcon />,
            items: [{ text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', desc: 'Vista general' }]
          },
          {
            id: 'gestion',
            title: 'GESTIÓN',
            icon: <PeopleIcon />,
            items: [
              { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/users', desc: 'Gestionar usuarios' },
              { text: 'Clases (Grados)', icon: <ClassIcon />, path: '/admin/classes', desc: 'Administrar grados' },
              { text: 'Materias', icon: <SchoolIcon />, path: '/admin/subjects', desc: 'Gestionar asignaturas' },
              { text: 'Asignaciones', icon: <AssignmentIcon />, path: '/admin/assignments', desc: 'Asignar profesores' },
              { text: 'Matrículas', icon: <SchoolIcon />, path: '/admin/enrollments', desc: 'Matricular estudiantes' },
            ]
          },
          {
            id: 'academicos',
            title: 'ACADÉMICO',
            icon: <GradeIcon />,
            items: [
              { text: 'Calificaciones', icon: <GradeIcon />, path: '/admin/grades', desc: 'Ver calificaciones' },
              { text: 'Asistencia', icon: <EventNoteIcon />, path: '/admin/attendance', desc: 'Reporte asistencia' },
              { text: 'Boletines', icon: <AssessmentIcon />, path: '/admin/report-card', desc: 'Generar boletines' },
            ]
          },
          {
            id: 'reportes',
            title: 'REPORTES',
            icon: <DescriptionIcon />,
            items: [
              { text: 'Reportes', icon: <DescriptionIcon />, path: '/admin/reports', desc: 'Generar PDF' },
              { text: 'Estadísticas', icon: <BarChartIcon />, path: '/admin/statistics', desc: 'Análisis de datos' },
            ]
          },
          {
            id: 'sistema',
            title: 'SISTEMA',
            icon: <SettingsIcon />,
            items: [{ text: 'Configuración', icon: <SettingsIcon />, path: '/admin/settings', desc: 'Ajustes' }]
          }
        ]
      }
    }
    // ... Otros roles (teacher, student, parent) se mantienen igual ...
    return { sections: [] }
  }

  const menuData = getMenuItems()

  const renderSection = (section) => {
    const isOpen = openSections[section.id] !== false
    return (
      <Box sx={{ mb: 1 }}>
        <ListItem onClick={() => handleSectionClick(section.id)} sx={{ px: 2, py: 0.75, cursor: 'pointer', '&:hover': { backgroundColor: '#F5F3EE' } }}>
          <ListItemIcon sx={{ minWidth: 40, color: '#6C63FF' }}>{section.icon}</ListItemIcon>
          <ListItemText primary={section.title} primaryTypographyProps={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: '#888' }} />
          {isOpen ? <ExpandLess sx={{ color: '#888', fontSize: 18 }} /> : <ExpandMore sx={{ color: '#888', fontSize: 18 }} />}
        </ListItem>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List sx={{ py: 0, pl: 2 }}>
            {section.items.map((item) => (
              <ListItem
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerToggle(); // Cierra el menú al hacer clic en móvil
                }}
                selected={location.pathname === item.path}
                sx={{ 
                  cursor: 'pointer', borderRadius: '10px', mx: 1, mb: 0.5, py: 0.75,
                  '&.Mui-selected': { backgroundColor: '#6C63FF12', '& .MuiListItemIcon-root': { color: '#6C63FF' } }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#6C63FF' : '#AAA', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} secondary={item.desc} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 10 }} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    )
  }

  const drawerContent = (
    <Box sx={{ overflow: 'auto', py: 2 }}>
      {menuData.sections.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < menuData.sections.length - 1 && <Divider sx={{ my: 1, mx: 2 }} />}
        </React.Fragment>
      ))}
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none', boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)' },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </Box>
  )
}

export default Sidebar