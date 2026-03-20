import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
    tsconfigPaths: true,
  },
  plugins: [tanstackStart({ srcDirectory: 'app' }), viteReact()],
  css: {
    postcss: './postcss.config.js',
  },
})
