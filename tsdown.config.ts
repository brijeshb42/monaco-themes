import { defineConfig, type UserConfig } from 'tsdown';
import pkg from './package.json' with { type: 'json' };

const commonConfig: UserConfig = {
  clean: true,
  sourcemap: true,
  platform: 'browser',
  treeshake: true,
  skipNodeModulesBundle: true,
  env: {
    NODE_ENV: 'production',
  },
  banner: {
    js: `/**
 * ${pkg.name} v${pkg.version}
  * (c) ${new Date().getFullYear()} ${pkg.author}
  * @license ${pkg.license}
 */`
  }
};

export default defineConfig([
  // ESM build
  {
    ...commonConfig,
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
  },
  // IIFE/UMD build
  {
    ...commonConfig,
    entry: { 'monaco-themes': 'src/index.ts' },
    globalName: 'MonacoThemes',
    format: 'iife',
    dts: false,
    outputOptions: {
      globals: {
        'fast-plist': 'FastPlist',
      },
    },
  },
]);
