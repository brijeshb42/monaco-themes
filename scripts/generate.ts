import fs from 'node:fs';
import path from 'node:path';
import { parseTmTheme } from '../src/index.ts';

function ext(themeName: string): import('../src/index.ts').MonacoTheme {
  const lpath = path.join(process.cwd(), 'tmthemes', `${themeName}.tmTheme`);
  const fileData = fs.readFileSync(lpath, 'utf8');
  const theme = parseTmTheme(fileData);
  // Support minimap background color.
  // @see https://github.com/microsoft/monaco-editor/issues/908
  theme.rules.unshift({
    background: theme.colors['editor.background'].replace('#', ''),
    token: '',
  });
  return theme;
}

function snakeCase(fname: string): string {
  return fname.toLowerCase().replace(/[_() ]/g, '-');
}

function generate(themePath: string) {
  const files = fs.readdirSync(themePath);
  const gen: Record<string, string> = {};

  files.forEach((file) => {
    let fname = file.split('.');
    fname.pop();
    if (!fname.length || !fname[0]) {
      return;
    }
    const finalName = fname.join('.');
    fs.writeFileSync(
      path.join(process.cwd(), 'themes', finalName + '.json'),
      JSON.stringify(ext(finalName), null, 2),
      'utf8'
    );
    gen[snakeCase(finalName)] = finalName;
  });
  console.log(gen);

  fs.writeFileSync(
    path.join(process.cwd(), 'themes', 'themelist.json'),
    JSON.stringify(gen, null, 2),
    'utf8'
  );
}

generate(path.join(process.cwd(), 'tmthemes'));
