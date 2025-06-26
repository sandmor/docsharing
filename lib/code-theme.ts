const grey = "rgb(99, 119, 119)";
const purple = "rgb(199, 146, 234)";
const teal = "rgb(128, 203, 196)";
const aqua = "rgb(127, 219, 202)";
const blue = "rgb(130, 170, 255)";
const red = "rgba(239, 83, 80, 0.56)";
const pink = "rgb(255, 88, 116)";
const orange = "rgb(247, 140, 108)";
const green = "rgb(173, 219, 103)";
const white = "rgb(214, 222, 235)";
const yellow = "#e90";

const tokenStyles = {
  comment: { color: grey, fontStyle: "italic" },
  prolog: { color: grey, fontStyle: "italic" },
  doctype: { color: grey, fontStyle: "italic" },
  cdata: { color: grey, fontStyle: "italic" },
  punctuation: { color: purple },
  property: { color: teal },
  tag: { color: aqua },
  constant: { color: blue },
  symbol: { color: blue },
  deleted: { color: red, fontStyle: "italic" },
  boolean: { color: pink },
  number: { color: orange },
  selector: { color: purple, fontStyle: "italic" },
  "attr-name": { color: green, fontStyle: "italic" },
  string: { color: green },
  char: { color: green },
  builtin: { color: green },
  inserted: { color: green },
  operator: { color: aqua },
  entity: { color: green, cursor: "help" },
  url: { color: green },
  variable: { color: white },
  atrule: { color: purple },
  "attr-value": { color: purple },
  function: { color: blue },
  "function-variable": { color: blue },
  keyword: { color: purple },
  regex: { color: yellow },
  important: { color: yellow, fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

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

const lexicalBase = Object.fromEntries(
  Object.entries(tokenStyles)
    .filter(([, style]) => "color" in style)
    .map(([token, style]) => [token, (style as { color: string }).color])
);

export const lexicalCodeTheme: Record<string, string> = {
  ...lexicalBase,
  attr: tokenStyles.property.color,
  class: tokenStyles.string.color,
  "class-name": tokenStyles.string.color,
  namespace: tokenStyles.string.color,
};
