import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Railway (and any host) injects PORT; default keeps local `npm start` working.
  preview: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
  },
})
