import { MermaidConfig, MermaidRenderResult, RenderOptions } from "./types";
import { MermaidIframeRenderer } from "./mermaid-iframe-renderer";
import { MermaidPngConverter } from "./mermaid-png-converter";
import { ClipboardUtil } from "./clipboard-util";

// Singleton renderer manager
class MermaidRendererManager {
  private static instance: MermaidRendererManager | null = null;
  private renderer: MermaidIframeRenderer | null = null;

  private constructor() {
    this.setupCleanup();
  }

  static getInstance(): MermaidRendererManager {
    if (!MermaidRendererManager.instance) {
      MermaidRendererManager.instance = new MermaidRendererManager();
    }
    return MermaidRendererManager.instance;
  }

  initialize(config: MermaidConfig = {}, templatePath?: string): void {
    if (this.renderer) {
      this.renderer.destroy();
    }
    this.renderer = new MermaidIframeRenderer(config, templatePath);
  }

  async render(
    id: string,
    diagramText: string,
    options: RenderOptions = {}
  ): Promise<MermaidRenderResult> {
    if (!this.renderer) {
      this.initialize();
    }

    try {
      return await this.renderer!.render(id, diagramText, options);
    } catch (error) {
      console.error("Mermaid rendering error:", error);
      throw new Error("Failed to render Mermaid diagram");
    }
  }

  async updateConfig(config: Partial<MermaidConfig>): Promise<void> {
    if (!this.renderer) {
      throw new Error("Renderer not initialized");
    }
    return this.renderer.updateConfig(config);
  }

  async ping(): Promise<number> {
    if (!this.renderer) {
      throw new Error("Renderer not initialized");
    }
    return this.renderer.ping();
  }

  destroy(): void {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }

  private setupCleanup(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.destroy());
    }
  }
}

// Public API
const rendererManager = MermaidRendererManager.getInstance();

export const initializeMermaid = (
  config: MermaidConfig = {},
  templatePath?: string
): void => {
  rendererManager.initialize(config, templatePath);
};

export const renderMermaidToSvg = async (
  id: string,
  diagramText: string,
  options: RenderOptions = {}
): Promise<MermaidRenderResult> => {
  return rendererManager.render(id, diagramText, options);
};

export const updateMermaidConfig = async (
  config: Partial<MermaidConfig>
): Promise<void> => {
  return rendererManager.updateConfig(config);
};

export const pingRenderer = async (): Promise<number> => {
  return rendererManager.ping();
};

export const convertMermaidSvgToPng = async (
  svgString: string,
  options: RenderOptions = {}
): Promise<string> => {
  return MermaidPngConverter.convert(svgString, options);
};

export const copyPngToClipboard = async (pngDataUrl: string): Promise<void> => {
  return ClipboardUtil.copyPngToClipboard(pngDataUrl);
};

export const renderAndCopyMermaidAsPng = async (
  id: string,
  diagramText: string,
  options: RenderOptions = {}
): Promise<void> => {
  const { svg } = await renderMermaidToSvg(id, diagramText, options);
  const pngDataUrl = await convertMermaidSvgToPng(svg, options);
  await copyPngToClipboard(pngDataUrl);
};

// Initialize with default config
initializeMermaid();
