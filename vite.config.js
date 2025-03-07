import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Las rutas serán relativas al directorio actual
  plugins: [react()],
})
