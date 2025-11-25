import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: '.',
  publicDir: 'themes',
  build: {
    outDir: 'dist-dev',
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      'monaco-themes': path.resolve(__dirname, './src/index.ts'),
    },
  },
});
