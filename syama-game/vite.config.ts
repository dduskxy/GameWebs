import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path set for GitHub Pages deployment: https://dduskxy.github.io/GameWebs/syama-game/
export default defineConfig({
  plugins: [react()],
  base: '/GameWebs/syama-game/',
})
