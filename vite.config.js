import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'image-vendor': ['fabric', 'face-api.js', '@imgly/background-removal'],
          'ui-vendor': ['lucide-react', 'react-hot-toast', 'react-dropzone'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    target: 'esnext', // Upgraded to esnext for modern browser execution speed
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'fabric', 'face-api.js'],
  },
})