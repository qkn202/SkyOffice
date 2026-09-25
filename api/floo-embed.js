export default async function handler(req, res) {
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
    res.status(200).send(html)
  } catch (err) {
    res.status(500).send(`Lỗi kết nối Mạng Floo: ${err?.message || err}`)
  }
}
