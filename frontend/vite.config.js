import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// In development /api is proxied through the Vite server, so the browser only
// talks to one origin. This keeps the Spring Boot session cookie (JSESSIONID)
// first-party, which matters in GitHub Codespaces where each forwarded port is
// a different site.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_BACKEND_URL || 'http://localhost:8080'

  const backend = { target, changeOrigin: false, xfwd: true }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': backend,
      },
    },
  }
})
