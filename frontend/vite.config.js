import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar librerías grandes para mejor rendimiento
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'calendar-vendor': ['@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid'],
          'data-vendor': ['@mui/x-data-grid', '@tanstack/react-query'],
        }
      }
    },
    // Optimizar chunks
    chunkSizeWarningLimit: 1000,
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', 'axios']
  }
})