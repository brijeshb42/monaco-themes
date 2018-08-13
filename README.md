## monaco-themes

A list of theme definitions to be used with [monaco-editor](https://microsoft.github.io/monaco-editor/) in browser. See [demo]('https://bitwiser.in/monaco-themes/')

### Usage

#### With webpack

```sh
npm install monaco-themes
```

```js
const monaco = /* require monaco */

import('monaco-themes/themes/Monokai.json')
  .then(data => {
      monaco.editor.defineTheme('monokai', data);
  })
```

#### Independently

Download this [repository](https://github.com/brijeshb42/monaco-themes/archive/master.zip) and extract and save `themes` directory in your project.

```js
/* load monaco */

fetch('/themes/Monokai.json')
  .then(data => data.json())
  .then(data => {
    monaco.editor.defineTheme('monokai', data);
    monaco.editor.setTheme('monokai');
  })
```

### Todo

All properties have not been mapped from tmTheme files to the generated JSON. Those will be mapped one at a time after going through the internals of vscode to see all the available color options.
