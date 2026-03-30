import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

// ── Mapa de roles → rutas ────────────────────────────────────────────────────
const ROLE_ROUTES = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
}

// ── Descripciones de cada rol (panel lateral) ────────────────────────────────
const ROLE_INFO = [
  {
    role: 'admin',
    label: 'Administrador',
    icon: '⚙',
    desc: 'Gestión completa del sistema, usuarios y reportes.',
  },
  {
    role: 'teacher',
    label: 'Profesor',
    icon: '📖',
    desc: 'Toma de asistencia, calificaciones y actividades.',
  },
  {
    role: 'student',
    label: 'Estudiante',
    icon: '🎒',
    desc: 'Consulta notas, asistencia y boletín académico.',
  },
  {
    role: 'parent',
    label: 'Acudiente',
    icon: '👨‍👩‍👧',
    desc: 'Seguimiento académico y asistencia de tus hijos.',
  },
]

// ── Estilos globales (fuente Instrument Serif) ───────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
`

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) {
      setError('Completa todos los campos para continuar.')
      return
    }
    setLoading(true)
    setError('')
    
    console.log('=== INICIANDO LOGIN ===')
    console.log('Usuario:', formData.username)
    
    const result = await login(formData.username, formData.password)
    
    console.log('Resultado completo del login:', result)
    console.log('Usuario en resultado:', result.user)
    console.log('Rol del usuario:', result.user?.role)
    
    if (result.success && result.user) {
      const role = result.user.role
      const route = ROLE_ROUTES[role]
      
      console.log(`✅ Rol detectado: ${role}`)
      console.log(`✅ Ruta a redirigir: ${route}`)
      
      if (route) {
        // Asegurar que el estado de autenticación se actualice antes de redirigir
        setTimeout(() => {
          navigate(route, { replace: true })
        }, 100)
      } else {
        console.error('❌ Ruta no encontrada para rol:', role)
        setError('Rol de usuario no válido. Contacta al administrador.')
        setLoading(false)
      }
    } else {
      console.error('❌ Error en login:', result.error)
      setError(result.error || 'Credenciales incorrectas. Intenta de nuevo.')
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          fontFamily: '"DM Sans", sans-serif',
          background: '#F5F3EE',
        }}
      >
        {/* ── Panel izquierdo (identidad) ── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '42%',
            minWidth: 380,
            background: '#1A1A2E',
            p: '48px 52px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Patrón decorativo sutil */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                'radial-gradient(circle at 30% 20%, #6C63FF 0%, transparent 50%), radial-gradient(circle at 80% 80%, #4ECDC4 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
          {/* Cuadrícula puntillada */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.06,
              backgroundImage:
                'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
            }}
          />

          {/* Logo / nombre sistema */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 6,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                🎓
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: 20,
                  color: '#ffffff',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                }}
              >
                EduPlataforma
              </Typography>
            </Box>

            <Typography
              sx={{
                fontFamily: '"Instrument Serif", serif',
                fontSize: { md: 38, lg: 46 },
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                mb: 2,
              }}
            >
              El colegio en
              <br />
              <Box component="span" sx={{ color: '#4ECDC4', fontStyle: 'italic' }}>
                digital.
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
                maxWidth: 340,
              }}
            >
              Asistencias, notas, boletines y comunicación entre docentes,
              estudiantes y familias — todo en un solo lugar.
            </Typography>
          </Box>

          {/* Roles disponibles */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                mb: 2,
              }}
            >
              Acceso para
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {ROLE_INFO.map((r) => (
                <Box
                  key={r.role}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                    transition: 'background .2s',
                    '&:hover': { background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <Box sx={{ fontSize: 18, lineHeight: 1, mt: '1px', flexShrink: 0 }}>
                    {r.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', mb: 0.25 }}
                    >
                      {r.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                      {r.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Panel derecho (formulario) ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {/* Logo móvil */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                gap: 1.5,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                🎓
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: 18,
                  color: '#1A1A2E',
                }}
              >
                EduPlataforma
              </Typography>
            </Box>

            {/* Encabezado */}
            <Box sx={{ mb: 5 }}>
              <Typography
                sx={{
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: { xs: 30, sm: 36 },
                  color: '#1A1A2E',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                Bienvenido
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
                Ingresa con tu{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 500,
                    color: '#555',
                    borderBottom: '1.5px dotted #aaa',
                    pb: '1px',
                  }}
                >
                  nombre de usuario o correo
                </Box>{' '}
                para continuar.
              </Typography>
            </Box>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{
                  mb: 3,
                  borderRadius: '10px',
                  fontSize: 13,
                  background: '#FEF2F2',
                  color: '#7F1D1D',
                  border: '0.5px solid #FECACA',
                  '& .MuiAlert-icon': { color: '#EF4444' },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Campo usuario */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  component="label"
                  htmlFor="username"
                  sx={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#444', mb: 0.75, letterSpacing: '0.02em' }}
                >
                  Usuario o correo electrónico
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '10px',
                    border: `1.5px solid ${focused === 'username' ? '#6C63FF' : '#E0DDD8'}`,
                    background: '#fff',
                    transition: 'border-color .15s, box-shadow .15s',
                    boxShadow: focused === 'username' ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
                  }}
                >
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    placeholder="ej: juan.perez o juan@colegio.edu.co"
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: '12px 16px',
                      fontSize: 14,
                      color: '#1A1A2E',
                      fontFamily: '"DM Sans", sans-serif',
                      borderRadius: '10px',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 11, color: '#AAA', mt: 0.5, ml: 0.5 }}>
                  Acepta nombre de usuario o dirección de correo
                </Typography>
              </Box>

              {/* Campo contraseña */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography
                    component="label"
                    htmlFor="password"
                    sx={{ fontSize: 12, fontWeight: 500, color: '#444', letterSpacing: '0.02em' }}
                  >
                    Contraseña
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '10px',
                    border: `1.5px solid ${focused === 'password' ? '#6C63FF' : '#E0DDD8'}`,
                    background: '#fff',
                    transition: 'border-color .15s, box-shadow .15s',
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: '12px 16px',
                      fontSize: 14,
                      color: '#1A1A2E',
                      fontFamily: '"DM Sans", sans-serif',
                      borderRadius: '10px',
                    }}
                  />
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    sx={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      pr: 1.5,
                      color: '#AAA',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': { color: '#555' },
                    }}
                  >
                    {showPassword
                      ? <VisibilityOff sx={{ fontSize: 18 }} />
                      : <Visibility sx={{ fontSize: 18 }} />}
                  </Box>
                </Box>
              </Box>

              {/* Botón principal */}
              <Box
                component="button"
                type="submit"
                disabled={loading}
                sx={{
                  width: '100%',
                  py: 1.75,
                  border: 'none',
                  borderRadius: '10px',
                  background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: '"DM Sans", sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'transform .1s, opacity .15s',
                  '&:hover:not(:disabled)': { opacity: 0.88, transform: 'translateY(-1px)' },
                  '&:active:not(:disabled)': { transform: 'scale(0.99)' },
                }}
              >
                {loading ? 'Verificando...' : 'Ingresar al sistema →'}
              </Box>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                <Box sx={{ flex: 1, height: '0.5px', background: '#E0DDD8' }} />
                <Typography sx={{ fontSize: 12, color: '#BBB' }}>¿nuevo en el sistema?</Typography>
                <Box sx={{ flex: 1, height: '0.5px', background: '#E0DDD8' }} />
              </Box>

              {/* Botón registro */}
              <Box
                component="button"
                type="button"
                onClick={() => navigate('/register')}
                sx={{
                  width: '100%',
                  py: 1.5,
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#1A1A2E',
                  fontSize: 14,
                  fontWeight: 450,
                  fontFamily: '"DM Sans", sans-serif',
                  cursor: 'pointer',
                  transition: 'border-color .15s, background .15s',
                  '&:hover': { borderColor: '#6C63FF', background: '#FAFAFF' },
                }}
              >
                Crear cuenta nueva
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Login