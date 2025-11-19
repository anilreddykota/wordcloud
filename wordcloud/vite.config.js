import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Optimize chunks for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['chart.js', 'chartjs-chart-wordcloud', 'react-chartjs-2'],
          d3: ['d3', 'd3-cloud']
        }
      }
    }
  },
  server: {
    // Enable compression
    compress: true
  }
})
