import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    {
      name: 'nojekyll',
      closeBundle() {
        // GitHub Pages 需要 .nojekyll 才能正确提供 _ 开头的文件
        writeFileSync(resolve(__dirname, 'dist', '.nojekyll'), '')
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
  },
  // GitHub Pages 部署
  base: '/yuxzeh/',
})
