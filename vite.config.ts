
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保 process.env.API_KEY 在前端環境中可用，符合 Gemini SDK 規範
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
