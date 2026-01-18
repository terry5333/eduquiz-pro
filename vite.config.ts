
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 優先讀取環境變數中的 API_KEY，這是 Vercel 的標準作法
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
});
