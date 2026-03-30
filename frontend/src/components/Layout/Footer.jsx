import React from 'react'
import { Box, Typography, Link } from '@mui/material'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {'© '}
        <Link color="inherit" href="#">
          Sistema Académico
        </Link>{' '}
        {new Date().getFullYear()}
        {'. Todos los derechos reservados.'}
      </Typography>
    </Box>
  )
}

export default Footer