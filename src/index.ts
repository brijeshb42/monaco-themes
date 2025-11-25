import * as plist from 'fast-plist';

export interface MonacoTheme {
  base: 'vs-dark' | 'vs';
  inherit: boolean;
  rules: {
    token: string;
    foreground?: string;
    background?: string;
    fontStyle?: string;
  }[];
  colors: Record<string, string>;
}

interface RawThemeSettings {
  settings: Array<{
    scope?: string | string[];
    settings?: {
      foreground?: string;
      background?: string;
      fontStyle?: string;
    };
  }>;
  gutterSettings?: Record<string, string>;
}

interface ColorMapping {
  tm: string;
  mn: string;
}

/**
 * Taken from ACE editor
 */
function rgbColor(color: string | number[]): number[] {
  if (typeof color === 'object') {
    return color;
  }
  if (color[0] === '#') {
    return color
      .match(/^#(..)(..)(..)/)!
      .slice(1)
      .map((c) => parseInt(c, 16));
  } else {
    return color
      .match(/\(([^,]+),([^,]+),([^,]+)/)!
      .slice(1)
      .map((c) => parseInt(c, 10));
  }
}

function darkness(color: string): number {
  const rgb = rgbColor(color);
  return (0.21 * rgb[0] + 0.72 * rgb[1] + 0.07 * rgb[2]) / 255;
}

function parseColor(color: string): string | null {
  if (!color.length) return null;
  let normalizedColor = color;
  if (normalizedColor.length === 4) {
    normalizedColor = normalizedColor.replace(/[a-fA-F\d]/g, '$&$&');
  }
  if (normalizedColor.length === 7) {
    return normalizedColor;
  }
  if (normalizedColor.length === 9) {
    return normalizedColor; // substr(0, 7);
  } else {
    const match = normalizedColor.match(/^#(..)(..)(..)(..)$/);
    if (!match) {
      console.error("can't parse color", normalizedColor);
      return null;
    }
    const rgba = match.slice(1).map((c) => parseInt(c, 16));
    rgba[3] = parseFloat((rgba[3] / 0xff).toPrecision(2));
    return `rgba(${rgba.join(', ')})`;
  }
}

/* Mapped from vscode/src/vs/workbench/services/themes/electron-browser/themeCompatibility.ts */
const COLOR_MAP: ColorMapping[] = [
  {
    tm: 'foreground',
    mn: 'editor.foreground',
  },
  {
    tm: 'background',
    mn: 'editor.background',
  },
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

const ansiColorMap = [
  'ansiBlack',
  'ansiRed',
  'ansiGreen',
  'ansiYellow',
  'ansiBlue',
  'ansiMagenta',
  'ansiCyan',
  'ansiWhite',
  'ansiBrightBlack',
  'ansiBrightRed',
  'ansiBrightGreen',
  'ansiBrightYellow',
  'ansiBrightBlue',
  'ansiBrightMagenta',
  'ansiBrightCyan',
  'ansiBrightWhite',
];

ansiColorMap.forEach((color) => {
  COLOR_MAP.push({
    tm: color,
    mn: 'terminal.' + color,
  });
});

const GUTTER_COLOR_MAP: ColorMapping[] = [];

/**
 * @param rawTmThemeString - The contents read from a tmTheme file.
 * @returns A monaco compatible theme definition. See https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonethemedata.html
 */
export function parseTmTheme(rawTmThemeString: string): MonacoTheme {
  const rawData = plist.parse(rawTmThemeString) as RawThemeSettings;
  const globalSettings = rawData.settings[0]?.settings || {};
  const gutterSettings = rawData.gutterSettings;
  const rules: MonacoTheme['rules'] = [];

  rawData.settings.forEach((setting) => {
    if (!setting.settings) {
      return;
    }

    let scopes: string[];

    if (typeof setting.scope === 'string') {
      scopes = setting.scope
        .replace(/^[,]+/, '')
        .replace(/[,]+$/, '')
        .split(',');
    } else if (Array.isArray(setting.scope)) {
      scopes = setting.scope;
    } else {
      scopes = [''];
    }

    const rule: Partial<MonacoTheme['rules'][0]> = {};
    const settings = setting.settings;

    if (settings.foreground) {
      const foregroundColor = parseColor(settings.foreground);
      if (foregroundColor) {
        rule.foreground = foregroundColor.toLowerCase().replace('#', '');
      }
    }

    if (settings.background) {
      const backgroundColor = parseColor(settings.background);
      if (backgroundColor) {
        rule.background = backgroundColor.toLowerCase().replace('#', '');
      }
    }

    if (settings.fontStyle && typeof settings.fontStyle === 'string') {
      rule.fontStyle = settings.fontStyle;
    }

    scopes.forEach((scope) => {
      if (!scope || !Object.keys(rule).length) {
        return;
      }
      const r = {
        ...rule,
        token: scope.trim(),
      } as MonacoTheme['rules'][0];
      rules.push(r);
    });
  });

  const globalColors: Record<string, string> = {};

  /* More properties to be added */
  COLOR_MAP.forEach((obj) => {
    if (globalSettings[obj.tm as keyof typeof globalSettings]) {
      const color = parseColor(
        globalSettings[obj.tm as keyof typeof globalSettings] as string,
      );
      if (color) {
        globalColors[obj.mn] = color;
      }
    }
  });

  if (gutterSettings) {
    GUTTER_COLOR_MAP.forEach((obj) => {
      if (gutterSettings[obj.tm]) {
        const color = parseColor(gutterSettings[obj.tm]);
        if (color) {
          globalColors[obj.mn] = color;
        }
      }
    });
  }

  const editorBg = globalColors['editor.background'];
  const base = editorBg && darkness(editorBg) < 0.5 ? 'vs-dark' : 'vs';

  return {
    base,
    inherit: true,
    rules,
    colors: globalColors,
  };
}
