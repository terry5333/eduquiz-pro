 import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DO NOT define process.env or request that the user update the API_KEY in the code.
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});
