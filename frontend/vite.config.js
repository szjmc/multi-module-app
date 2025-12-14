import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // 用于部署到子目录或相对路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined // 避免代码分割问题
      }
    }
  },
  server: {
    host: true, // 允许外部访问
    port: 5173
  }
})
