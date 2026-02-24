import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively by browsers
          'vendor-react': ['react', 'react-dom'],
          // Router — changes rarely
          'vendor-router': ['react-router-dom'],
          // State management
          'vendor-state': ['zustand', 'axios'],
        },
      },
    },
    // Warn on chunks > 500 kB
    chunkSizeWarningLimit: 500,
  },
})
