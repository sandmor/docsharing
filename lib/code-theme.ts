// =================================================================================
// Common
// =================================================================================

// Single source of truth for all theme colors
const themeColors = {
  grey: "rgb(99, 119, 119)",
  purple: "rgb(199, 146, 234)",
  teal: "rgb(128, 203, 196)",
  aqua: "rgb(127, 219, 202)",
  blue: "rgb(130, 170, 255)",
  red: "rgba(239, 83, 80, 0.56)",
  pink: "rgb(255, 88, 116)",
  orange: "rgb(247, 140, 108)",
  green: "rgb(173, 219, 103)",
  white: "rgb(214, 222, 235)",
  yellow: "#e90",
} as const;

// Token style definitions with semantic meaning
const tokenStyleDefinitions = {
  comment: { color: "grey", fontStyle: "italic" as const },
  prolog: { color: "grey", fontStyle: "italic" as const },
  doctype: { color: "grey", fontStyle: "italic" as const },
  cdata: { color: "grey", fontStyle: "italic" as const },
  punctuation: { color: "purple" },
  property: { color: "teal" },
  tag: { color: "aqua" },
  constant: { color: "blue" },
  symbol: { color: "blue" },
  deleted: { color: "red", fontStyle: "italic" as const },
  boolean: { color: "pink" },
  number: { color: "orange" },
  selector: { color: "purple", fontStyle: "italic" as const },
  "attr-name": { color: "green", fontStyle: "italic" as const },
  string: { color: "green" },
  char: { color: "green" },
  builtin: { color: "green" },
  inserted: { color: "green" },
  operator: { color: "aqua" },
  entity: { color: "green", cursor: "help" as const },
  url: { color: "green" },
  variable: { color: "white" },
  atrule: { color: "purple" },
  "attr-value": { color: "purple" },
  function: { color: "blue" },
  "function-variable": { color: "blue" },
  keyword: { color: "purple" },
  regex: { color: "yellow" },
  important: { color: "yellow", fontWeight: "bold" as const },
  bold: { fontWeight: "bold" as const },
  italic: { fontStyle: "italic" as const },
} as const;

// =================================================================================
// Prism Theme for react-syntax-highlighter
// =================================================================================

// Convert semantic definitions to actual CSS values for react-syntax-highlighter
const tokenStyles = Object.entries(tokenStyleDefinitions).reduce(
  (acc, [key, value]) => {
    const style: any = { ...value };
    if ("color" in value && value.color) {
      style.color = themeColors[value.color as keyof typeof themeColors];
    }
    acc[key] = style;
    return acc;
  },
  {} as Record<string, any>
);

export const codeTheme = {
  "code[class*='language-']": {
    color: "#d6deeb",
    fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    mozTabSize: "4",
    oTabSize: "4",
    tabSize: "4",
    webkitHyphens: "none",
    mozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
  },
  "pre[class*='language-']": {
    color: "#d6deeb",
    fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    mozTabSize: "4",
    oTabSize: "4",
    tabSize: "4",
    webkitHyphens: "none",
    mozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    padding: "1em",
    margin: ".5em 0",
    overflow: "auto",
    background: "#011627",
  },
  ":not(pre) > code[class*='language-']": {
    padding: ".1em",
    borderRadius: ".3em",
    whiteSpace: "normal",
  },
  ...tokenStyles,
  ".namespace": {
    opacity: ".7",
  },
  ".language-css .token.string": tokenStyles.string,
  ".style .token.string": tokenStyles.string,
};

// =================================================================================
// Lexical Theme
// =================================================================================

// CSS class-based theme for Lexical code highlighting
export const lexicalCodeTheme: Record<string, string> = {
  comment: "lexical-code-comment",
  prolog: "lexical-code-comment",
  doctype: "lexical-code-comment",
  cdata: "lexical-code-comment",
  punctuation: "lexical-code-punctuation",
  property: "lexical-code-property",
  tag: "lexical-code-tag",
  constant: "lexical-code-constant",
  symbol: "lexical-code-constant",
  deleted: "lexical-code-deleted",
  boolean: "lexical-code-boolean",
  number: "lexical-code-number",
  selector: "lexical-code-selector",
  "attr-name": "lexical-code-attr-name",
  string: "lexical-code-string",
  char: "lexical-code-string",
  builtin: "lexical-code-string",
  inserted: "lexical-code-string",
  operator: "lexical-code-operator",
  entity: "lexical-code-entity",
  url: "lexical-code-string",
  variable: "lexical-code-variable",
  atrule: "lexical-code-atrule",
  "attr-value": "lexical-code-atrule",
  function: "lexical-code-function",
  "function-variable": "lexical-code-function",
  keyword: "lexical-code-keyword",
  regex: "lexical-code-regex",
  important: "lexical-code-important",
  attr: "lexical-code-property",
  class: "lexical-code-string",
  "class-name": "lexical-code-string",
  namespace: "lexical-code-string",
};

// Helper function to create CSS variables from token definitions
function createCSSVariables(
  definitions: typeof tokenStyleDefinitions
): React.CSSProperties {
  const cssVars: Record<string, string> = {};

  Object.entries(definitions).forEach(([token, style]) => {
    if ("color" in style && style.color) {
      const colorKey = style.color as keyof typeof themeColors;
      cssVars[`--lexical-code-${token}`] = themeColors[colorKey];
    }
  });

  return cssVars as React.CSSProperties;
}

// Alternative approach: Generate CSS variables automatically
export const lexicalCodeThemeVarsAuto = createCSSVariables(
  tokenStyleDefinitions
);
