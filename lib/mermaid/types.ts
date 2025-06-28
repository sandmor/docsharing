import { MermaidConfig } from "mermaid";

export interface MermaidRenderResult {
  svg: string;
  bindFunctions?: Function;
  method?: "direct" | "dom";
}

export interface MermaidRenderError {
  success: false;
  error: string;
}

export interface MermaidRenderSuccess {
  success: true;
  svg: string;
  method?: "direct" | "dom";
}

export interface RenderOptions {
  width?: number;
  height?: number;
  timeout?: number;
}

export type { MermaidConfig };
