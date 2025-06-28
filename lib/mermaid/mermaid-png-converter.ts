import { RenderOptions } from "./types";
import { PNG_CONVERSION_DELAY } from "./constants";
import { createOffscreenElement, extractDimensions } from "./utils";

export class MermaidPngConverter {
  static async convert(
    svgString: string,
    options: RenderOptions = {}
  ): Promise<string> {
    const { width, height } = options;

    return new Promise((resolve, reject) => {
      const container = createOffscreenElement();
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "14px";
      container.style.lineHeight = "1.2";
      document.body.appendChild(container);

      try {
        const svgElement = this.prepareSvgElement(container, svgString);
        const dimensions = this.calculateDimensions(svgElement, width, height);

        this.configureContainer(container, dimensions);
        this.configureSvgElement(svgElement, dimensions);
        this.processTextElements(svgElement);

        svgElement.getBoundingClientRect();

        setTimeout(() => {
          this.convertToCanvas(svgElement, dimensions, container)
            .then(resolve)
            .catch(reject);
        }, PNG_CONVERSION_DELAY);
      } catch (error) {
        document.body.removeChild(container);
        reject(error);
      }
    });
  }

  private static prepareSvgElement(
    container: HTMLElement,
    svgString: string
  ): SVGSVGElement {
    container.innerHTML = svgString;
    const svgElement = container.querySelector("svg");

    if (!svgElement) {
      throw new Error("No SVG element found");
    }

    return svgElement;
  }

  private static calculateDimensions(
    svgElement: SVGSVGElement,
    width?: number,
    height?: number
  ) {
    if (width && height) {
      return { width, height };
    }

    const extracted = extractDimensions(svgElement);
    return {
      width: width || extracted.width,
      height: height || extracted.height,
    };
  }

  private static configureContainer(
    container: HTMLElement,
    dimensions: { width: number; height: number }
  ): void {
    container.style.width = dimensions.width + "px";
    container.style.height = dimensions.height + "px";
  }

  private static configureSvgElement(
    svgElement: SVGSVGElement,
    dimensions: { width: number; height: number }
  ): void {
    svgElement.setAttribute("width", dimensions.width.toString());
    svgElement.setAttribute("height", dimensions.height.toString());
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.style.fontFamily = "Arial, sans-serif";
    svgElement.style.fontSize = "14px";
  }

  private static processTextElements(svgElement: SVGSVGElement): void {
    const textElements = svgElement.querySelectorAll("text, tspan");
    textElements.forEach((element) => {
      if (!element.getAttribute("font-family")) {
        element.setAttribute("font-family", "Arial, sans-serif");
      }
      if (!element.getAttribute("font-size")) {
        element.setAttribute("font-size", "14");
      }
      if (!element.getAttribute("fill")) {
        element.setAttribute("fill", "black");
      }

      const textEl = element as SVGTextElement;
      textEl.style.fontFamily = "Arial, sans-serif";
      textEl.style.fontSize = "14px";
    });

    const gElements = svgElement.querySelectorAll("g");
    gElements.forEach((g) => {
      if (g.querySelector("text")) {
        g.style.fontFamily = "Arial, sans-serif";
        g.style.fontSize = "14px";
      }
    });
  }

  private static async convertToCanvas(
    svgElement: SVGSVGElement,
    dimensions: { width: number; height: number },
    container: HTMLElement
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const serializer = new XMLSerializer();
        const serializedSvg = serializer.serializeToString(svgElement);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        const scale = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * scale;
        canvas.height = dimensions.height * scale;
        canvas.style.width = dimensions.width + "px";
        canvas.style.height = dimensions.height + "px";

        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.textBaseline = "alphabetic";

        const img = new Image();

        img.onload = () => {
          try {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, dimensions.width, dimensions.height);
            ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

            const dataUrl = canvas.toDataURL("image/png", 1.0);
            document.body.removeChild(container);
            resolve(dataUrl);
          } catch (error) {
            document.body.removeChild(container);
            reject(new Error("Failed to draw SVG to canvas"));
          }
        };

        img.onerror = () => {
          document.body.removeChild(container);
          reject(new Error("Failed to load SVG image"));
        };

        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          serializedSvg
        )}`;
        img.src = dataUrl;
      } catch (error) {
        document.body.removeChild(container);
        reject(error);
      }
    });
  }
}
