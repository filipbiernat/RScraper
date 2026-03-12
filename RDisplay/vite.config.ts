import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-local-data',
      configureServer(server) {
        server.middlewares.use((req: any, res: any, next) => {
          if (req.url?.startsWith('/RScraper/data/')) {
            const filePath = path.resolve(__dirname, '..', req.url.replace('/RScraper/', ''));
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath);
              res.setHeader('Access-Control-Allow-Origin', '*');
              if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json');
              if (filePath.endsWith('.csv')) res.setHeader('Content-Type', 'text/csv');
              res.end(content);
              return;
            }
          } else if (req.url === '/RScraper/sources.json') {
            const filePath = path.resolve(__dirname, '../sources.json');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  base: '/RScraper/',
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist'
  }
})
