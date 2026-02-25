import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        proxy: {
            '/api': {
                target: 'https://kisan-krishi-kendra-admin.vercel.app/',
                changeOrigin: true
            },
            '/uploads': {
                target: 'https://kisan-krishi-kendra-admin.vercel.app/',
                changeOrigin: true
            }
        }
    }
})
