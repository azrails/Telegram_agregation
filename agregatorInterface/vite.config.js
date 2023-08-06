import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxImportSource: "@emotion/react",
    babel: {
      plugins: ["@emotion/babel-plugin"],
    },
  })],
  server:{
    watch:{
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173
  }
})
