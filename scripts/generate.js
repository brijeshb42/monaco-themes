const fs = require('fs');
const path = require('path');
const json5 = require('json5');

const monacoTheme = require('../src/index');

function ext(themeName) {
  const lpath = path.join(process.cwd(), 'tmthemes', `${themeName}.tmTheme`);
  const fileData = fs.readFileSync(lpath, 'utf8');
  return monacoTheme.parseTmTheme(fileData);
}

function snakeCase(fname) {
  return fname.toLowerCase().replace(/[_() ]/g, '-');
}

function parseVsTheme(themeName) {
  const lpath = path.join(process.cwd(), 'vsthemes', `${themeName}.json`);
  const jsonData = json5.parse(fs.readFileSync(lpath, 'utf8'));
  const base = typeof jsonData.type !== undefined ? jsonData.type : (darkness(jsonData.colors['editor.background']) < 0.5 ? 'dark' : 'light');
  const rules = [];
  jsonData.tokenColors.forEach((data) => {
    if (data.scope === undefined) {
      rules.push(Object.assign({ token: '', }, data.settings))
    } else if (Array.isArray(data.scope)) {
      data.scope.forEach(scope => {
        rules.push(Object.assign({ token: scope }, data.settings));
      });
    } else if (typeof data.scope === 'string') {
      rules.push(Object.assign({ token: data.scope }, data.settings));
    }
  });

  const themeData = {
    base: base === 'dark' ? 'vs-dark' : 'vs',
    inherit: true,
    colors: jsonData.colors,
    rules,
  };

  return themeData;
}

function generateTheme(themePath, type) {
  const files = fs.readdirSync(themePath);
  const gen = {};

  files.forEach(file => {
    let fname = file.split('.');
    fname.pop()
    if (!fname.length || !fname[0]) {
      return;
    }
    fname = fname.join('.');
    const parsedTheme = type === 'vs' ? parseVsTheme(fname) : ext(fname);
    fs.writeFileSync(path.join(process.cwd(), 'themes', fname + '.json'), JSON.stringify(parsedTheme, null, 2), 'utf8');
    gen[snakeCase(fname)] = fname;
  });

  return gen;

}

let themeInfo = generateTheme(path.join(process.cwd(), 'tmthemes'));
console.log(themeInfo);
themeInfo = Object.assign(themeInfo, generateTheme(path.join(process.cwd(), 'vsthemes'), 'vs'));
console.log(themeInfo);

fs.writeFileSync(path.join(process.cwd(), 'themes', 'themelist.json'), JSON.stringify(themeInfo, null, 2), 'utf8');
