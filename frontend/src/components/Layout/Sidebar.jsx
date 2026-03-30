import React, { useState } from 'react'
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Toolbar, Divider, Typography, Collapse } from '@mui/material'
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

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  // Estado para secciones colapsables
  const [openSections, setOpenSections] = useState({
    principal: true,
    gestion: true,
    academicos: true,
    reportes: true,
    sistema: true
  })

  const handleSectionClick = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return {
        sections: [
          {
            id: 'principal',
            title: 'PRINCIPAL',
            icon: <DashboardIcon />,
            items: [
              { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', desc: 'Vista general' }
            ]
          },
          {
            id: 'gestion',
            title: 'GESTIÓN',
            icon: <PeopleIcon />,
            items: [
              { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/users', desc: 'Gestionar usuarios del sistema' },
              { text: 'Clases (Grados)', icon: <ClassIcon />, path: '/admin/classes', desc: 'Administrar grados y niveles' },
              { text: 'Materias', icon: <SchoolIcon />, path: '/admin/subjects', desc: 'Gestionar asignaturas' },
              { text: 'Asignaciones', icon: <AssignmentIcon />, path: '/admin/assignments', desc: 'Asignar profesores a clases' },
              { text: 'Matrículas', icon: <SchoolIcon />, path: '/admin/enrollments', desc: 'Matricular estudiantes' },
            ]
          },
          {
            id: 'academicos',
            title: 'ACADÉMICO',
            icon: <GradeIcon />,
            items: [
              { text: 'Calificaciones', icon: <GradeIcon />, path: '/admin/grades', desc: 'Ver todas las calificaciones' },
              { text: 'Asistencia', icon: <EventNoteIcon />, path: '/admin/attendance', desc: 'Reporte de asistencia' },
              { text: 'Boletines', icon: <AssessmentIcon />, path: '/admin/report-card', desc: 'Generar boletines' },
            ]
          },
          {
            id: 'reportes',
            title: 'REPORTES',
            icon: <DescriptionIcon />,
            items: [
              { text: 'Reportes', icon: <DescriptionIcon />, path: '/admin/reports', desc: 'Generar reportes PDF' },
              { text: 'Estadísticas', icon: <BarChartIcon />, path: '/admin/statistics', desc: 'Análisis de datos' },
            ]
          },
          {
            id: 'sistema',
            title: 'SISTEMA',
            icon: <SettingsIcon />,
            items: [
              { text: 'Configuración', icon: <SettingsIcon />, path: '/admin/settings', desc: 'Ajustes del sistema' },
            ]
          }
        ]
      }
    } else if (user?.role === 'teacher') {
      return {
        sections: [
          {
            id: 'principal',
            title: 'PRINCIPAL',
            icon: <DashboardIcon />,
            items: [
              { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher', desc: 'Vista general' }
            ]
          },
          {
            id: 'gestion',
            title: 'GESTIÓN ACADÉMICA',
            icon: <GradeIcon />,
            items: [
              { text: 'Calificaciones', icon: <GradeIcon />, path: '/teacher/grades', desc: 'Gestionar calificaciones' },
              { text: 'Asistencia', icon: <EventNoteIcon />, path: '/teacher/attendance', desc: 'Tomar asistencia' },
              { text: 'Boletines', icon: <AssessmentIcon />, path: '/teacher/report-card', desc: 'Generar boletines' },
            ]
          }
        ]
      }
    } else if (user?.role === 'student') {
      return {
        sections: [
          {
            id: 'principal',
            title: 'PRINCIPAL',
            icon: <DashboardIcon />,
            items: [
              { text: 'Dashboard', icon: <DashboardIcon />, path: '/student', desc: 'Vista general' }
            ]
          },
          {
            id: 'consultas',
            title: 'MIS DATOS',
            icon: <GradeIcon />,
            items: [
              { text: 'Mis Notas', icon: <GradeIcon />, path: '/student/grades', desc: 'Consultar calificaciones' },
              { text: 'Mi Asistencia', icon: <EventNoteIcon />, path: '/student/attendance', desc: 'Ver asistencia' },
              { text: 'Mi Boletín', icon: <AssessmentIcon />, path: '/student/report-card', desc: 'Descargar boletín' },
            ]
          }
        ]
      }
    } else if (user?.role === 'parent') {
      return {
        sections: [
          {
            id: 'principal',
            title: 'PRINCIPAL',
            icon: <DashboardIcon />,
            items: [
              { text: 'Dashboard', icon: <DashboardIcon />, path: '/parent', desc: 'Vista general' }
            ]
          },
          {
            id: 'seguimiento',
            title: 'SEGUIMIENTO',
            icon: <PeopleIcon />,
            items: [
              { text: 'Notas de mis hijos', icon: <GradeIcon />, path: '/parent/grades', desc: 'Ver calificaciones' },
              { text: 'Asistencia', icon: <EventNoteIcon />, path: '/parent/attendance', desc: 'Ver asistencia' },
              { text: 'Boletín', icon: <AssessmentIcon />, path: '/parent/report-card', desc: 'Descargar boletín' },
            ]
          }
        ]
      }
    }
    return { sections: [] }
  }

  const menuData = getMenuItems()
  const isAdmin = user?.role === 'admin'

  const renderSection = (section) => {
    if (!section.items || section.items.length === 0) return null
    
    const isOpen = openSections[section.id] !== false
    
    return (
      <Box sx={{ mb: 1 }}>
        {/* Cabecera de sección con flecha */}
        <ListItem
          onClick={() => handleSectionClick(section.id)}
          sx={{
            px: 2,
            py: 0.75,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#F5F3EE',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#6C63FF' }}>
            {section.icon}
          </ListItemIcon>
          <ListItemText 
            primary={section.title}
            primaryTypographyProps={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#888'
            }}
          />
          {isOpen ? <ExpandLess sx={{ color: '#888', fontSize: 18 }} /> : <ExpandMore sx={{ color: '#888', fontSize: 18 }} />}
        </ListItem>
        
        {/* Items de la sección */}
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List sx={{ py: 0, pl: 2 }}>
            {section.items.map((item) => (
              <ListItem
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                sx={{ 
                  cursor: 'pointer',
                  borderRadius: '10px',
                  mx: 1,
                  mb: 0.5,
                  py: 0.75,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    backgroundColor: '#6C63FF12',
                    '& .MuiListItemIcon-root': {
                      color: '#6C63FF'
                    },
                    '& .MuiListItemText-primary': {
                      color: '#1A1A2E',
                      fontWeight: 600
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#F5F3EE',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? '#6C63FF' : '#AAA',
                  minWidth: 36
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  secondary={item.desc}
                  primaryTypographyProps={{ 
                    fontSize: 13,
                    fontWeight: location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 600 : 400
                  }}
                  secondaryTypographyProps={{
                    fontSize: 10,
                    color: '#AAA',
                    sx: { mt: 0.25 }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    )
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          border: 'none',
          background: '#fff',
          boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 2 }}>
        {menuData.sections.map((section, index) => (
          <React.Fragment key={section.id}>
            {renderSection(section)}
            {index < menuData.sections.length - 1 && <Divider sx={{ my: 1, mx: 2 }} />}
          </React.Fragment>
        ))}
      </Box>
    </Drawer>
  )
}

export default Sidebar