import { MermaidConfig } from "mermaid";

export const DEFAULT_CONFIG: MermaidConfig = {
  theme: "default",
  logLevel: 5,
  securityLevel: "loose",
  startOnLoad: false,
  flowchart: {
    htmlLabels: true,
    curve: "basis",
  },
};

export const DEFAULT_TIMEOUT = 10000;
export const IFRAME_READY_TIMEOUT = 5000;
export const PNG_CONVERSION_DELAY = 200;
