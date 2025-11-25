import { defineConfig } from 'tsdown';

export default defineConfig([
  // ESM build
  {
    entry: ['src/index.ts'],
    format: 'esm',
    clean: true,
    dts: true,
    sourcemap: true,
    outDir: 'dist',
    platform: 'browser',
    external: [],
    treeshake: true,
  },
  // CJS build
  {
    entry: ['src/index.ts'],
    format: 'cjs',
    dts: false,
    sourcemap: true,
    outDir: 'dist',
    platform: 'browser',
    external: [],
    treeshake: true,
  },
  // IIFE/UMD build
  {
    entry: { 'monaco-themes': 'src/index.ts' },
    format: 'iife',
    dts: false,
    sourcemap: true,
    outDir: 'dist',
    globalName: 'MonacoThemes',
    platform: 'browser',
    external: [],
    treeshake: true,
    outputOptions: {
      globals: {
        'fast-plist': 'FastPlist',
      },
    },
  },
]);
