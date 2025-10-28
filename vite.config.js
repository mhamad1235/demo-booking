import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    allowedHosts: true // Allow all hosts (for development only) OR
    // Alternatively, you can specify an array of allowed hosts:
    // allowedHosts: ['5c715fd6886c.ngrok-free.app', 'localhost']
  }
})
