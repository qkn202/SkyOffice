import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function flooEmbedPlugin(): Plugin {
  return {
    name: 'floo-embed-proxy',
    configureServer(server) {
      server.middlewares.use('/api/floo-embed', async (req, res) => {
        try {
          const upstreamUrl = 'https://www.hpvn-archive.net/floo?hpvn_update=ea7cfe4'
          const response = await fetch(upstreamUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            },
          })

          let html = await response.text()
          if (html.includes('<head>')) {
            html = html.replace('<head>', '<head><base href="https://www.hpvn-archive.net/">')
          } else {
            html = html.replace('<html>', '<html><head><base href="https://www.hpvn-archive.net/"></head>')
          }

          const customStyle = `
            <style>
              *, *::before, *::after {
                box-shadow: none !important;
                text-shadow: none !important;
                --tw-shadow: 0 0 #0000 !important;
              }
              ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }
              ::-webkit-scrollbar-track {
                background: #0d0716;
              }
              ::-webkit-scrollbar-thumb {
                background: #3b1d5a;
                border-radius: 3px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #c8aa6e;
              }
            </style>
          `
          html = html.replace('</head>', `${customStyle}</head>`)

          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.end(html)
        } catch (err: any) {
          res.statusCode = 500
          res.end(`Lỗi kết nối Mạng Floo: ${err?.message || err}`)
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), flooEmbedPlugin()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
})
