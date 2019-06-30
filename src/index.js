var plist = require('fast-plist');

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

function parseColor(color) {
  if (!color.length) return null;
  if (color.length == 4)
    color = color.replace(/[a-fA-F\d]/g, "$&$&");
  if (color.length == 7)
    return color
  if (color.length == 9)
    return color; // substr(0, 7);
  else {
    if (!color.match(/^#(..)(..)(..)(..)$/))
      console.error("can't parse color", color);
    var rgba = color.match(/^#(..)(..)(..)(..)$/).slice(1).map(function(c) {
      return parseInt(c, 16);
    });
    rgba[3] = (rgba[3] / 0xFF).toPrecision(2);
    return "rgba(" + rgba.join(", ") + ")";
  }
}

/* Mapped from vscode/src/vs/workbench/services/themes/electron-browser/themeCompatibility.ts */
var COLOR_MAP = [
  {
    tm: 'foreground',
    mn: 'editor.foreground',
  },
  {
    tm: 'background',
    mn: 'editor.background',
  },
  // {
  //   tm: 'foreground',
  //   mn: 'editorSuggestWidget.foreground',
  // },
  // {
  //   tm: 'background',
  //   mn: 'editorSuggestWidget.background',
  // },
  {
    tm: 'selection',
    mn: 'editor.selectionBackground',
  },
  {
    tm: 'inactiveSelection',
    mn: 'editor.inactiveSelectionBackground',
  },
  {
    tm: 'selectionHighlightColor',
    mn: 'editor.selectionHighlightBackground',
  },
  {
    tm: 'findMatchHighlight',
    mn: 'editor.findMatchHighlightBackground',
  },
  {
    tm: 'currentFindMatchHighlight',
    mn: 'editor.findMatchBackground',
  },
  {
    tm: 'hoverHighlight',
    mn: 'editor.hoverHighlightBackground',
  },
  {
    tm: 'wordHighlight',
    mn: 'editor.wordHighlightBackground',
  },
  {
    tm: 'wordHighlightStrong',
    mn: 'editor.wordHighlightStrongBackground',
  },
  {
    tm: 'findRangeHighlight',
    mn: 'editor.findRangeHighlightBackground',
  },
  {
    tm: 'findMatchHighlight',
    mn: 'peekViewResult.matchHighlightBackground',
  },
  {
    tm: 'referenceHighlight',
    mn: 'peekViewEditor.matchHighlightBackground',
  },
  {
    tm: 'lineHighlight',
    mn: 'editor.lineHighlightBackground',
  },
  {
    tm: 'rangeHighlight',
    mn: 'editor.rangeHighlightBackground',
  },
  {
    tm: 'caret',
    mn: 'editorCursor.foreground',
  },
  {
    tm: 'invisibles',
    mn: 'editorWhitespace.foreground',
  },
  {
    tm: 'guide',
    mn: 'editorIndentGuide.background',
  },
  {
    tm: 'activeGuide',
    mn: 'editorIndentGuide.activeBackground',
  },
  {
    tm: 'selectionBorder',
    mn: 'editor.selectionHighlightBorder',
  },
];

var ansiColorMap = ['ansiBlack', 'ansiRed', 'ansiGreen', 'ansiYellow', 'ansiBlue', 'ansiMagenta', 'ansiCyan', 'ansiWhite',
  'ansiBrightBlack', 'ansiBrightRed', 'ansiBrightGreen', 'ansiBrightYellow', 'ansiBrightBlue', 'ansiBrightMagenta', 'ansiBrightCyan', 'ansiBrightWhite'
];

ansiColorMap.forEach((color) => {
  COLOR_MAP.push({
    tm: color,
    mn: 'terminal.' + color,
  });
});

var GUTTER_COLOR_MAP = [
];


/**
 * @param {string} rawTmThemeString - The contents read from a tmTheme file.
 * @returns {IStandaloneThemeData} A monaco compatible theme definition. See https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonethemedata.html
 */
exports.parseTmTheme = function parseTmTheme(rawTmThemeString) {
  var rawData = plist.parse(rawTmThemeString);
  var globalSettings = rawData.settings[0].settings;
  var gutterSettings = rawData.gutterSettings;
  var rules = [];

  rawData.settings.forEach(setting => {
    if (!setting.settings) {
      return;
    }

    var scopes;

    if (typeof setting.scope === 'string') {
      scopes = setting.scope.replace(/^[,]+/, '').replace(/[,]+$/, '').split(',');
    } else if (Array.isArray(setting.scope)) {
      scopes = setting.scope;
    } else {
      scopes = [''];
    }

    var rule = {};
    var settings = setting.settings;

    if (settings.foreground) {
      rule.foreground = parseColor(settings.foreground).toLowerCase().replace('#', '');
    }

    if (settings.background) {
      rule.background = parseColor(settings.background).toLowerCase().replace('#', '');
    }

    if (settings.fontStyle && typeof settings.fontStyle === 'string') {
      rule.fontStyle = settings.fontStyle;
    }

    scopes.forEach(scope => {
      if (!scope || !Object.keys(rule).length) {
        return;
      }
      var r = Object.assign({}, rule, {
        token: scope.trim(),
      });
      rules.push(r);
    });
  });

  var globalColors = {};

  /* More properties to be added */
  COLOR_MAP.forEach((obj) => {
    if (globalSettings[obj.tm]) {
      globalColors[obj.mn] = parseColor(globalSettings[obj.tm]);
    }
  });

  if (gutterSettings) {
    GUTTER_COLOR_MAP.forEach((obj) => {
      if (gutterSettings[obj.tm]) {
        globalColors[obj.mn] = parseColor(gutterSettings[obj.tm]);
      }
    });
  }

  return {
    base: (darkness(globalColors['editor.background']) < 0.5) ? 'vs-dark' : 'vs',
    inherit: true,
    rules: rules,
    colors: globalColors,
  };
}
