import { MermaidConfig } from "mermaid";
import { MermaidRenderResult, RenderOptions } from "./types";
import { DEFAULT_CONFIG, DEFAULT_TIMEOUT, IFRAME_READY_TIMEOUT } from "./constants";
import { IframeTemplateLoader } from "./iframe-template-loader";
import { generateRequestId, createOffscreenElement } from "./utils";

export class MermaidIframeRenderer {
  private iframe: HTMLIFrameElement | null = null;
  private channel: BroadcastChannel | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (result: MermaidRenderResult) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private config: MermaidConfig;
  private templatePath: string;

  constructor(
    config: MermaidConfig = {},
    templatePath: string = "/mermaid-iframe.html"
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.templatePath = templatePath;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.createInitializationPromise();
    return this.initPromise;
  }

  private async createInitializationPromise(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Iframe initialization timeout"));
      }, IFRAME_READY_TIMEOUT);

      try {
        await this.setupIframe();
        this.setupCommunication();

        // Wait for iframe ready signal
        const readyHandler = (event: MessageEvent) => {
          if (event.data.type === "ready") {
            this.channel?.removeEventListener("message", readyHandler);
            clearTimeout(timeout);
            this.isInitialized = true;
            resolve();
          }
        };

        this.channel?.addEventListener("message", readyHandler);
        document.body.appendChild(this.iframe!);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async setupIframe(): Promise<void> {
    this.iframe = createOffscreenElement("iframe") as HTMLIFrameElement;

    try {
      const template = await IframeTemplateLoader.loadTemplate(
        this.templatePath
      );
      const templateWithConfig = IframeTemplateLoader.injectConfig(
        template,
        this.config
      );
      this.iframe.srcdoc = templateWithConfig;
    } catch (error) {
      throw new Error(`Failed to setup iframe: ${error}`);
    }
  }

  private setupCommunication(): void {
    this.channel = new BroadcastChannel("mermaid-renderer");
    this.channel.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage = (event: MessageEvent): void => {
    const data = event.data;

    if (data.type === "ready" || data.type === "pong" || !data.requestId) {
      return;
    }

    const request = this.pendingRequests.get(data.requestId);
    if (!request) return;

    clearTimeout(request.timeout);
    this.pendingRequests.delete(data.requestId);

    if (data.success) {
      request.resolve({
        svg: data.svg,
        method: data.method,
      });
    } else {
      request.reject(new Error(data.error));
    }
  };

  async render(
    id: string,
    diagramText: string,
    options: RenderOptions = {}
  ): Promise<MermaidRenderResult> {
    await this.initialize();

    const requestId = generateRequestId(id);
    const timeout = options.timeout || DEFAULT_TIMEOUT;

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Mermaid rendering timeout"));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      if (!this.channel) {
        clearTimeout(timeoutHandle);
        this.pendingRequests.delete(requestId);
        reject(new Error("Mermaid renderer not initialized"));
        return;
      }

      this.channel.postMessage({
        type: "render",
        requestId,
        diagramText,
      });
    });
  }

  async updateConfig(newConfig: Partial<MermaidConfig>): Promise<void> {
    if (!this.channel || !this.isInitialized) {
      throw new Error("Renderer not initialized");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Config update timeout"));
      }, 5000);

      const handler = (event: MessageEvent) => {
        if (event.data.type === "config-updated") {
          this.channel?.removeEventListener("message", handler);
          clearTimeout(timeout);

          if (event.data.success) {
            this.config = { ...this.config, ...newConfig };
            resolve();
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      this.channel!.addEventListener("message", handler);
      this.channel!.postMessage({
        type: "config-update",
        config: newConfig,
      });
    });
  }

  async ping(): Promise<number> {
    if (!this.channel || !this.isInitialized) {
      throw new Error("Renderer not initialized");
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        reject(new Error("Ping timeout"));
      }, 5000);

      const handler = (event: MessageEvent) => {
        if (event.data.type === "pong") {
          this.channel?.removeEventListener("message", handler);
          clearTimeout(timeout);
          resolve(Date.now() - startTime);
        }
      };

      this.channel!.addEventListener("message", handler);
      this.channel!.postMessage({ type: "ping" });
    });
  }

  destroy(): void {
    this.cleanupPendingRequests();
    this.cleanupCommunication();
    this.cleanupIframe();
    this.resetState();
  }

  private cleanupPendingRequests(): void {
    this.pendingRequests.forEach(({ timeout, reject }) => {
      clearTimeout(timeout);
      reject(new Error("Renderer destroyed"));
    });
    this.pendingRequests.clear();
  }

  private cleanupCommunication(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }

  private cleanupIframe(): void {
    if (this.iframe?.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;
    }
  }

  private resetState(): void {
    this.isInitialized = false;
    this.initPromise = null;
  }
}
