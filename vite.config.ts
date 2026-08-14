import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function getBackendTarget() {
  try {
    const portFile = path.resolve(__dirname, '.active-port');
    if (fs.existsSync(portFile)) {
      const activePort = fs.readFileSync(portFile, 'utf-8').trim();
      if (activePort) {
        return `http://localhost:${activePort}`;
      }
    }
  } catch (e) { }
  return 'http://localhost:8081';
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: getBackendTarget(),
        changeOrigin: true,
      },
      '/uploads': {
        target: getBackendTarget(),
        changeOrigin: true,
      },
    },
  },
});
