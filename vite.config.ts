import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保 process.env 在瀏覽器端可用，這對 Gemini API 的調用至關重要
    'process.env': process.env
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
