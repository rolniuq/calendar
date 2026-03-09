import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to repo name for GitHub Pages deployment
// Change 'calendar' to your actual GitHub repo name if different
export default defineConfig({
  plugins: [react()],
  base: '/calendar/',
})
