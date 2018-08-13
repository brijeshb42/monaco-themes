const path = require('path');
const plist = require('plist');
const fs = require('fs');

/**
 * Taken from ACE editor
 */
function rgbColor(color) {
  if (typeof color == "object")
    return color;
  if (color[0] == "#")
    return color.match(/^#(..)(..)(..)/).slice(1).map(function(c) {
      return parseInt(c, 16);
    });
  else
    return color.match(/\(([^,]+),([^,]+),([^,]+)/).slice(1).map(function(c) {
      return parseInt(c, 10);
    });
}
function darkness(color) {
  var rgb = rgbColor(color);
  return (0.21 * rgb[0] + 0.72 * rgb[1] + 0.07 * rgb[2]) / 255;
}



function parseTheme(rawData) {
  const data = {};
  const globalSettings = rawData.settings[0].settings;
  const rules = [];

  rawData.settings.forEach(setting => {
    if (!setting.scope || !setting.settings) {
      return;
    }

    const scopes = setting.scope.split(',');
    const rule = {};
    const settings = setting.settings;

    if (settings.foreground) {
      rule.foreground = settings.foreground;
    }

    if (settings.background) {
      rule.background = settings.background;
    }

    if (settings.fontStyle) {
      rule.fontStyle = settings.fontStyle;
    }


    scopes.forEach(scope => {
      const r = Object.assign({}, rule, {
        token: scope.trim(),
      });
      rules.push(r);
    });
  });

  const globalColors = {};

  /* More properties to be added */
  [
    'background',
    'foreground', {
      tm: 'selection',
      mn: 'selectionHighlightBackground'
    }, {
      tm: 'lineHighlight',
      mn: 'lineHighlightBackground'
    },
  ].forEach(key => {
    let k, v;
    if (typeof key === 'string') {
      k = key;
      v = key;
    } else {
      k = key.tm;
      v = key.mn;
    }

    if (globalSettings[k]) {
      globalColors[`editor.${v}`] = globalSettings[k]
    }
  });

  return {
    base: (darkness(globalColors['editor.background']) < 0.5) ? 'vs-dark' : 'vs',
    inherit: true,
    rules: rules,
    colors: globalColors,
  };
}

function ext(themeName) {
  const lpath = path.join(process.cwd(), 'tmthemes', `${themeName}.tmTheme`);
  const fileData = fs.readFileSync(lpath, 'utf8');
  const tm = plist.parse(fileData);
  return parseTheme(tm);
}

function snakeCase(fname) {
  return fname.toLowerCase().replace(/[_() ]/g, '-');
}


function generate() {
  const files = fs.readdirSync(path.join(process.cwd(), 'tmthemes'));
  const gen = {};
  files.forEach(file => {
    let fname = file.split('.');
    fname.pop()
    if (!fname.length) {
      return;
    }
    fname = fname.join('.');
    fs.writeFileSync(path.join(process.cwd(), 'themes', fname + '.json'), JSON.stringify(ext(fname), null, 2), 'utf8');
    gen[snakeCase(fname)] = fname;
  });

  fs.writeFileSync(path.join(process.cwd(), 'themes', 'themelist.json'), JSON.stringify(gen, null, 2), 'utf8');
}

module.exports = generate;
