import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    root: '.',
    build: {
        outDir: 'build',
        emptyOutDir: true,
        rollupOptions: {}
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@images': path.resolve(__dirname, 'src/assets/images'),
        }
    },
    server: mode === 'development' ? {
        port: 8080,
        host: '0.0.0.0',
        https: false,
        proxy: {
            '/api': {
                target: 'http://localhost:32768',
                changeOrigin: true,
                secure: false
            }
        }
    } : undefined
}));
