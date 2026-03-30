import React from 'react'
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

const GradeCard = ({ subject, score = 0, trend, maxScore = 100 }) => {
  const getGradeColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'primary'
    if (score >= 40) return 'warning'
    return 'error'
  }

  const getGradeStatus = (score) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bueno'
    if (score >= 40) return 'Regular'
    return 'Necesita Mejorar'
  }

  const percentage = (score / maxScore) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              {subject || 'Sin asignatura'}
            </Typography>
            <Chip
              label={getGradeStatus(percentage)}
              size="small"
              color={getGradeColor(percentage)}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Calificación
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={`${getGradeColor(percentage)}.main`}>
              {score}/{maxScore}
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={getGradeColor(percentage)}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
              {trend > 0 ? (
                <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
              )}
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}% {trend > 0 ? 'de mejora' : 'de disminución'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default GradeCard