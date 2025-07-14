export const CODE_LANGUAGE_FRIENDLY_NAME_MAP: Record<string, string> = {
  c: "C",
  clike: "C-like",
  cpp: "C++",
  css: "CSS",
  dart: "Dart",
  go: "Go",
  graphql: "GraphQL",
  handlebars: "Handlebars",
  haskell: "Haskell",
  html: "HTML",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  kotlin: "Kotlin",
  markdown: "Markdown",
  markup: "Markup",
  objectivec: "Objective-C",
  perl: "Perl",
  php: "PHP",
  python: "Python",
  r: "R",
  ruby: "Ruby",
  rust: "Rust",
  sql: "SQL",
  swift: "Swift",
  toml: "TOML",
  typescript: "TypeScript",
  wasm: "WebAssembly",
  xml: "XML",
  yaml: "YAML",
};

export const CODE_LANGUAGE_OPTIONS = Object.entries(
  CODE_LANGUAGE_FRIENDLY_NAME_MAP
).map(([value, label]) => ({
  value,
  label,
}));
