import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Asana-Agent/',
  plugins: [
    react(),
    {
      name: 'production-security-meta',
      apply: 'build',
      transformIndexHtml: (html) => html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'self'; worker-src 'self' blob:; manifest-src 'self'">\n    <meta name="referrer" content="no-referrer">`,
      ),
    },
  ],
})
