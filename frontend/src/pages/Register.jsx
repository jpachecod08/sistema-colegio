import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Alert } from '@mui/material'
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material'
import api from '../services/api'

// ── Config ───────────────────────────────────────────────────────────────────
const ROLE_ROUTES = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
}

const ROLES = [
  {
    value: 'student',
    label: 'Estudiante',
    icon: '🎒',
    desc: 'Consulta tus notas, asistencia y boletín.',
    color: '#4ECDC4',
  },
  {
    value: 'teacher',
    label: 'Profesor',
    icon: '📖',
    desc: 'Gestiona notas, asistencia y actividades.',
    color: '#6C63FF',
  },
  {
    value: 'parent',
    label: 'Acudiente',
    icon: '👨‍👩‍👧',
    desc: 'Monitorea el progreso académico de tu hijo.',
    color: '#F59E0B',
  },
]

const STEPS = ['Tu rol', 'Datos personales', 'Cuenta', 'Confirmar']

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  input, textarea, select { font-family: "DM Sans", sans-serif; }
`

// ── Componente campo custom ───────────────────────────────────────────────────
const Field = React.memo(({ label, hint, children, required }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.75 }}>
      <Typography
        component="label"
        sx={{ fontSize: 12, fontWeight: 500, color: '#444', letterSpacing: '0.02em' }}
      >
        {label}
        {required && <Box component="span" sx={{ color: '#EF4444', ml: 0.25 }}>*</Box>}
      </Typography>
    </Box>
    {children}
    {hint && (
      <Typography sx={{ fontSize: 11, color: '#AAA', mt: 0.5, ml: 0.25 }}>
        {hint}
      </Typography>
    )}
  </Box>
))

// ── Componente Input CORREGIDO DEFINITIVAMENTE ──
const Input = React.memo(({ type = 'text', value, onChange, placeholder, name, autoComplete, suffix, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false)
  
  const handleChange = useCallback((e) => {
    onChange(e)
  }, [onChange])
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '10px',
        border: `1.5px solid ${isFocused ? '#6C63FF' : '#E0DDD8'}`,
        background: '#fff',
        boxShadow: isFocused ? '0 0 0 3px rgba(108,99,255,0.08)' : 'none',
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      <input
        name={name}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          padding: '11px 14px',
          fontSize: 13.5,
          color: '#1A1A2E',
        }}
        {...rest}
      />
      {suffix}
    </Box>
  )
})

// ── Componentes de cada paso (memoizados) ──
const Step0 = React.memo(({ form, setVal }) => (
  <Box>
    <Typography sx={{ fontSize: 13, color: '#888', mb: 3, lineHeight: 1.6 }}>
      Selecciona tu rol en la institución. Esto determina qué funciones tendrás acceso.
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {ROLES.map((r) => (
        <Box
          key={r.value}
          onClick={() => setVal('role', r.value)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: '14px 18px',
            borderRadius: '12px',
            border: `1.5px solid ${form.role === r.value ? r.color : '#E0DDD8'}`,
            background: form.role === r.value ? `${r.color}10` : '#fff',
            cursor: 'pointer',
            transition: 'all .15s',
            '&:hover': { borderColor: r.color, background: `${r.color}08` },
          }}
        >
          <Box sx={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E', mb: 0.25 }}>
              {r.label}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#888' }}>{r.desc}</Typography>
          </Box>
          {form.role === r.value && (
            <CheckCircle sx={{ fontSize: 18, color: r.color, flexShrink: 0 }} />
          )}
        </Box>
      ))}
    </Box>
    <Box
      sx={{
        mt: 2.5,
        p: '10px 14px',
        borderRadius: '8px',
        background: '#FFFBEB',
        border: '0.5px solid #FDE68A',
      }}
    >
      <Typography sx={{ fontSize: 12, color: '#92400E' }}>
        <strong>Nota:</strong> Las cuentas de profesor y acudiente deben ser activadas por un administrador del colegio.
      </Typography>
    </Box>
  </Box>
))

const Step1 = React.memo(({ form, handleChange }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
      <Field label="Nombre" required>
        <Input 
          name="first_name" 
          value={form.first_name} 
          onChange={handleChange('first_name')} 
          placeholder="Juan" 
          autoComplete="given-name" 
        />
      </Field>
      <Field label="Apellido" required>
        <Input 
          name="last_name" 
          value={form.last_name} 
          onChange={handleChange('last_name')} 
          placeholder="García" 
          autoComplete="family-name" 
        />
      </Field>
    </Box>
    <Field label="Teléfono" hint="Incluye el indicativo del país: +57">
      <Input 
        name="phone" 
        value={form.phone} 
        onChange={handleChange('phone')} 
        placeholder="+57 300 000 0000" 
        autoComplete="tel" 
      />
    </Field>
    <Field label="Dirección">
      <Box
        sx={{
          borderRadius: '10px',
          border: '1.5px solid #E0DDD8',
          background: '#fff',
          '&:focus-within': { borderColor: '#6C63FF', boxShadow: '0 0 0 3px rgba(108,99,255,0.08)' },
        }}
      >
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange('address')}
          placeholder="Calle 45 # 23-10, Medellín"
          rows={2}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: '11px 14px',
            fontSize: 13.5,
            color: '#1A1A2E',
            resize: 'none',
            display: 'block',
          }}
        />
      </Box>
    </Field>
    <Field label="Fecha de nacimiento">
      <Input 
        type="date" 
        name="birth_date" 
        value={form.birth_date} 
        onChange={handleChange('birth_date')} 
      />
    </Field>
  </Box>
))

const Step2 = React.memo(({ form, handleChange, showPass, setShowPass }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Field label="Nombre de usuario" required hint="Con este nombre ingresarás al sistema cada vez">
      <Input 
        name="username" 
        value={form.username} 
        onChange={handleChange('username')} 
        placeholder="juan.garcia" 
        autoComplete="username" 
      />
    </Field>
    <Field label="Correo electrónico" required hint="Puede usarse también para iniciar sesión">
      <Input 
        type="email" 
        name="email" 
        value={form.email} 
        onChange={handleChange('email')} 
        placeholder="juan@colegio.edu.co" 
        autoComplete="email" 
      />
    </Field>
    {form.role === 'student' && (
      <Field label="Código de estudiante" hint="Si el colegio ya te asignó un código, ingrésalo aquí (opcional)">
        <Input 
          name="student_code" 
          value={form.student_code} 
          onChange={handleChange('student_code')} 
          placeholder="EST-XXXXXXXX" 
        />
      </Field>
    )}
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
      <Field label="Contraseña" required hint="Mínimo 6 caracteres">
        <Input
          type={showPass ? 'text' : 'password'}
          name="password"
          value={form.password}
          onChange={handleChange('password')}
          placeholder="••••••••"
          autoComplete="new-password"
          suffix={
            <Box
              component="button"
              type="button"
              onClick={() => setShowPass(v => !v)}
              sx={{ border: 'none', background: 'none', cursor: 'pointer', pr: 1.5, color: '#AAA', display: 'flex', alignItems: 'center', '&:hover': { color: '#555' } }}
            >
              {showPass ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
            </Box>
          }
        />
      </Field>
      <Field label="Confirmar contraseña" required>
        <Input
          type={showPass ? 'text' : 'password'}
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange('confirm_password')}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>
    </Box>
    {form.password && (
      <Box>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
          {[1, 2, 3, 4].map((i) => {
            const strength = Math.min(
              Math.floor(
                (form.password.length >= 6 ? 1 : 0) +
                (/[A-Z]/.test(form.password) ? 1 : 0) +
                (/[0-9]/.test(form.password) ? 1 : 0) +
                (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0)
              ),
              4
            )
            const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']
            return (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i <= strength ? colors[strength - 1] : '#E0DDD8',
                  transition: 'background .2s',
                }}
              />
            )
          })}
        </Box>
        <Typography sx={{ fontSize: 11, color: '#AAA' }}>
          {form.password.length < 6
            ? 'Muy corta'
            : !/[A-Z]/.test(form.password)
            ? 'Agrega mayúsculas'
            : !/[0-9]/.test(form.password)
            ? 'Agrega números'
            : !/[^A-Za-z0-9]/.test(form.password)
            ? 'Agrega símbolos para mayor seguridad'
            : '¡Contraseña segura!'}
        </Typography>
      </Box>
    )}
  </Box>
))

const Step3 = React.memo(({ form, roleInfo }) => (
  <Box>
    <Typography sx={{ fontSize: 13, color: '#888', mb: 2.5, lineHeight: 1.6 }}>
      Revisa que todo esté correcto antes de crear tu cuenta.
    </Typography>

    <Box
      sx={{
        border: '0.5px solid #E0DDD8',
        borderRadius: '12px',
        overflow: 'hidden',
        mb: 2,
      }}
    >
      {[
        { label: 'Rol', value: roleInfo?.label, icon: roleInfo?.icon },
        { label: 'Nombre', value: `${form.first_name} ${form.last_name}` },
        { label: 'Usuario', value: form.username },
        { label: 'Correo', value: form.email },
        form.phone && { label: 'Teléfono', value: form.phone },
        form.birth_date && { label: 'Nacimiento', value: form.birth_date },
        form.student_code && { label: 'Código', value: form.student_code },
      ]
        .filter(Boolean)
        .map((row, i, arr) => (
          <Box
            key={row.label}
            sx={{
              display: 'flex',
              gap: 2,
              px: 2,
              py: 1.25,
              borderBottom: i < arr.length - 1 ? '0.5px solid #F0EDE8' : 'none',
              '&:nth-of-type(odd)': { background: '#FAFAF8' },
            }}
          >
            <Typography sx={{ fontSize: 12, color: '#888', minWidth: 80 }}>{row.label}</Typography>
            <Typography sx={{ fontSize: 13, color: '#1A1A2E', fontWeight: 450 }}>
              {row.icon && <Box component="span" sx={{ mr: 0.75 }}>{row.icon}</Box>}
              {row.value || '—'}
            </Typography>
          </Box>
        ))}
    </Box>

    <Box
      sx={{
        p: '10px 14px',
        borderRadius: '8px',
        background: '#F0FDF4',
        border: '0.5px solid #BBF7D0',
      }}
    >
      <Typography sx={{ fontSize: 12, color: '#166534' }}>
        Al crear tu cuenta aceptas los términos de uso del sistema académico.
      </Typography>
    </Box>
  </Box>
))

// ── Componente principal ──────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    role: 'student',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    birth_date: '',
    username: '',
    email: '',
    student_code: '',
    password: '',
    confirm_password: '',
  })

  // Funciones memoizadas
  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleChange = useCallback((field) => (e) => {
    updateField(field, e.target.value)
  }, [updateField])

  const setVal = useCallback((field, val) => {
    updateField(field, val)
  }, [updateField])

  // Validación por paso
  const validate = useCallback(() => {
    if (step === 0) return true
    if (step === 1) {
      if (!form.first_name.trim() || !form.last_name.trim()) {
        setError('Nombre y apellido son obligatorios.')
        return false
      }
    }
    if (step === 2) {
      if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirm_password) {
        setError('Todos los campos con * son obligatorios.')
        return false
      }
      if (!form.email.includes('@')) {
        setError('Ingresa un correo electrónico válido.')
        return false
      }
      if (form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        return false
      }
      if (form.password !== form.confirm_password) {
        setError('Las contraseñas no coinciden.')
        return false
      }
    }
    return true
  }, [step, form])

  const next = useCallback(() => {
    setError('')
    if (!validate()) return
    setStep(s => s + 1)
  }, [validate])

  const back = useCallback(() => {
    setError('')
    setStep(s => s - 1)
  }, [])

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post('/users/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        phone: form.phone || '',
        address: form.address || '',
        birth_date: form.birth_date || null,
        student_code: form.student_code || '',
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2800)
    } catch (err) {
      const data = err.response?.data || {}
      const msgs = []
      if (typeof data === 'object') {
        Object.entries(data).forEach(([k, v]) => {
          msgs.push(Array.isArray(v) ? v[0] : v)
        })
      }
      setError(msgs.length ? msgs.join(' · ') : 'Error al registrar. Verifica los datos.')
    } finally {
      setLoading(false)
    }
  }

  const roleInfo = useMemo(() => ROLES.find((r) => r.value === form.role), [form.role])

  // Memoizar el contenido del paso actual
  const currentStepContent = useMemo(() => {
    switch(step) {
      case 0:
        return <Step0 form={form} setVal={setVal} />
      case 1:
        return <Step1 form={form} handleChange={handleChange} />
      case 2:
        return <Step2 form={form} handleChange={handleChange} showPass={showPass} setShowPass={setShowPass} />
      case 3:
        return <Step3 form={form} roleInfo={roleInfo} />
      default:
        return null
    }
  }, [step, form, handleChange, setVal, showPass, roleInfo])

  // Pantalla de éxito
  if (success) return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F3EE',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 380, p: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#F0FDF4',
              border: '2px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              fontSize: 32,
            }}
          >
            ✓
          </Box>
          <Typography
            sx={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: 30,
              color: '#1A1A2E',
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            ¡Cuenta creada!
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#888', lineHeight: 1.7 }}>
            Tu cuenta como <strong>{roleInfo?.label}</strong> ha sido registrada. Redirigiendo al inicio de sesión...
          </Typography>
        </Box>
      </Box>
    </>
  )

  // Layout principal
  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#F5F3EE',
          fontFamily: '"DM Sans", sans-serif',
          py: { xs: 3, sm: 5 },
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 520 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/login')}
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
                sx={{ fontFamily: '"Instrument Serif", serif', fontSize: 17, color: '#1A1A2E' }}
              >
                EduPlataforma
              </Typography>
            </Box>
            <Box
              component="button"
              onClick={() => navigate('/login')}
              sx={{
                border: '0.5px solid #E0DDD8',
                borderRadius: '8px',
                background: '#fff',
                px: 1.5,
                py: 0.75,
                fontSize: 12,
                color: '#888',
                cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif',
                '&:hover': { color: '#1A1A2E', borderColor: '#aaa' },
              }}
            >
              ← Iniciar sesión
            </Box>
          </Box>

          {/* Stepper */}
          <Box sx={{ display: 'flex', gap: 0, mb: 5, position: 'relative' }}>
            {STEPS.map((s, i) => (
              <Box key={s} sx={{ flex: 1, position: 'relative' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 500,
                      transition: 'all .2s',
                      ...(i < step
                        ? { background: '#10B981', color: '#fff', border: 'none' }
                        : i === step
                        ? { background: '#1A1A2E', color: '#fff', border: 'none' }
                        : { background: '#fff', color: '#BBB', border: '1.5px solid #E0DDD8' }),
                    }}
                  >
                    {i < step ? '✓' : i + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: i === step ? '#1A1A2E' : i < step ? '#10B981' : '#BBB',
                      fontWeight: i === step ? 500 : 400,
                      textAlign: 'center',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {s}
                  </Typography>
                </Box>
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 14,
                      left: '50%',
                      width: '100%',
                      height: '1.5px',
                      background: i < step ? '#10B981' : '#E0DDD8',
                      transition: 'background .3s',
                      zIndex: -1,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Tarjeta del formulario */}
          <Box
            sx={{
              background: '#fff',
              borderRadius: '16px',
              border: '0.5px solid #E0DDD8',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, borderBottom: '0.5px solid #F0EDE8' }}>
              <Typography
                sx={{
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: 24,
                  color: '#1A1A2E',
                  letterSpacing: '-0.02em',
                  mb: 0.25,
                }}
              >
                {STEPS[step]}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#AAA' }}>
                Paso {step + 1} de {STEPS.length}
              </Typography>
            </Box>

            <Box sx={{ px: 3.5, py: 3 }}>
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError('')}
                  sx={{
                    mb: 2.5,
                    borderRadius: '8px',
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
              {currentStepContent}
            </Box>

            <Box
              sx={{
                px: 3.5,
                py: 2.5,
                borderTop: '0.5px solid #F0EDE8',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={back}
                disabled={step === 0}
                sx={{
                  px: 2,
                  py: 1.25,
                  border: '1px solid #E0DDD8',
                  borderRadius: '8px',
                  background: '#fff',
                  color: step === 0 ? '#DDD' : '#555',
                  fontSize: 13,
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: '"DM Sans", sans-serif',
                  transition: 'all .15s',
                  '&:hover:not(:disabled)': { borderColor: '#AAA', color: '#1A1A2E' },
                }}
              >
                ← Atrás
              </Box>

              {step < STEPS.length - 1 ? (
                <Box
                  component="button"
                  type="button"
                  onClick={next}
                  sx={{
                    flex: 1,
                    maxWidth: 200,
                    py: 1.25,
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: '"DM Sans", sans-serif',
                    transition: 'opacity .15s',
                    '&:hover': { opacity: 0.88 },
                  }}
                >
                  Continuar →
                </Box>
              ) : (
                <Box
                  component="button"
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    maxWidth: 200,
                    py: 1.25,
                    border: 'none',
                    borderRadius: '8px',
                    background: loading
                      ? '#9CA3AF'
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: '"DM Sans", sans-serif',
                    transition: 'opacity .15s',
                    '&:hover:not(:disabled)': { opacity: 0.88 },
                  }}
                >
                  {loading ? 'Creando cuenta...' : '✓ Crear cuenta'}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Register