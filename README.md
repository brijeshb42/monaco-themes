## monaco-themes

See extended demo at [https://editor.bitwiser.in](https://editor.bitwiser.in)

A list of theme definitions to be used with [monaco-editor](https://microsoft.github.io/monaco-editor/) in browser. See [minimal demo](https://bitwiser.in/monaco-themes/)

### Installation

```sh
npm install monaco-themes
# or
pnpm add monaco-themes
# or
yarn add monaco-themes
```

### Usage

#### API

##### Using ESM (Recommended)

```js
import { parseTmTheme } from 'monaco-themes';

const tmThemeString = /* read using FileReader */
const themeData = parseTmTheme(tmThemeString);
monaco.editor.defineTheme('mytheme', themeData);
monaco.editor.setTheme('mytheme');
```

##### Using CommonJS

```js
const { parseTmTheme } = require('monaco-themes');

const tmThemeString = /* read using FileReader */
const themeData = parseTmTheme(tmThemeString);
monaco.editor.defineTheme('mytheme', themeData);
monaco.editor.setTheme('mytheme');
```

##### Using `<script>` tag (IIFE/UMD)

```html
<script
  type="text/javascript"
  src="https://unpkg.com/monaco-themes/dist/monaco-themes.js"
></script>
<script type="text/javascript">
  var tmThemeString = /* read using FileReader */
  var themeData = MonacoThemes.parseTmTheme(tmThemeString);
  monaco.editor.defineTheme('mytheme', themeData);
  monaco.editor.setTheme('mytheme');
</script>
```

#### Directly using themes

##### With modern bundlers (Vite, Webpack, etc.)

```js
const monaco =
  /* import monaco */

  import('monaco-themes/themes/Monokai.json').then((data) => {
    monaco.editor.defineTheme('monokai', data.default || data);
    monaco.editor.setTheme('monokai');
  });
```

##### Using fetch

Download this [repository](https://github.com/brijeshb42/monaco-themes/archive/master.zip) and extract and save the `themes` directory in your project.

```js
/* load monaco */

fetch('/themes/Monokai.json')
  .then((data) => data.json())
  .then((data) => {
    monaco.editor.defineTheme('monokai', data);
    monaco.editor.setTheme('monokai');
  });
```

### Development

This project uses modern tooling:

- **pnpm** for package management
- **Vite** for local development server
- **tsdown** for building the library
- **TypeScript** for type safety
- **Node.js v22+** with native TypeScript support

#### Setup

```sh
pnpm install
```

#### Available Scripts

```sh
# Start development server with Vite
pnpm dev

# Build the library (ESM, CJS, and IIFE formats)
pnpm build

# Download theme files from source repositories
pnpm download

# Generate Monaco-compatible theme JSON files
pnpm generate
```

#### Building

The library is built with tsdown and outputs:

- **ESM** (`dist/index.js`) - ES Module format
- **CJS** (`dist/index.cjs`) - CommonJS format
- **IIFE** (`dist/monaco-themes.js`) - Browser-ready UMD-like format

All builds include TypeScript declarations and source maps.

### License

MIT
