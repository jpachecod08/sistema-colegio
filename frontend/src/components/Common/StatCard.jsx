import React from 'react'
import { Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon, color, trend, trendValue, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: color || 'primary.main' }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="textSecondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                bgcolor: `${color || '#1976d2'}15`,
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          </Box>
          
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5} mt={2}>
              {trend > 0 ? (
                <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
              )}
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trendValue}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                vs mes anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default StatCard