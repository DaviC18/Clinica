import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dono: Arquiteto. Decisões em docs/arquitetura.md, seções 4 e 7.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // A cena 3D passa de 200 KB por natureza e é carregada só sob o porteiro.
    chunkSizeWarningLimit: 1000,
  },
})
