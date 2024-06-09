import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import antStylesOverride from './src/assets/ant-styles-override'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 80,
  },
  plugins: [
    vue({
      script: {
        defineModel: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/scss/variables.scss"; @import "@/assets/scss/mixins.scss";`
      },
      less: {
        javascriptEnabled: true,
        modifyVars: antStylesOverride,
      },
    }
  }
})
