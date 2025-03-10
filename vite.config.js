import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Las rutas serán relativas al directorio actual
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Cambia este puerto al que uses para tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
