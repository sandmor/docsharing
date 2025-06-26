import mermaid, { MermaidConfig } from "mermaid";

export interface MermaidRenderResult {
  svg: string;
  bindFunctions?: (element: Element) => void;
}

/**
 * Initialize Mermaid with the given configuration
 */
export const initializeMermaid = (config: MermaidConfig = {}) => {
  mermaid.initialize({
    startOnLoad: false,
    theme: config.theme || "default",
    logLevel: config.logLevel || 5,
    flowchart: {
      htmlLabels: true,
      curve: "basis",
    },
    ...config,
  });
};

initializeMermaid();

/**
 * Render a Mermaid diagram to SVG
 */
export const renderMermaidToSvg = async (
  id: string,
  diagramText: string
): Promise<MermaidRenderResult> => {
  try {
    const result = await mermaid.render(
      `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`,
      diagramText
    );
    return result;
  } catch (error) {
    console.error("Mermaid rendering error:", error);
    throw new Error("Failed to render Mermaid diagram");
  }
};

/**
 * Convert Mermaid SVG to PNG with proper text rendering
 */
export const convertMermaidSvgToPng = async (
  svgString: string,
  width?: number,
  height?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a clean container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-10000px";
    container.style.left = "-10000px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "14px";
    container.style.lineHeight = "1.2";
    document.body.appendChild(container);

    try {
      // Insert the SVG
      container.innerHTML = svgString;
      const svgElement = container.querySelector("svg");

      if (!svgElement) {
        document.body.removeChild(container);
        reject(new Error("No SVG element found"));
        return;
      }

      // Extract dimensions from viewBox or existing width/height attributes
      let finalWidth = width;
      let finalHeight = height;

      if (!finalWidth || !finalHeight) {
        const viewBox = svgElement.getAttribute("viewBox");
        if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(Number);
          finalWidth = finalWidth || vbWidth || 800;
          finalHeight = finalHeight || vbHeight || 600;
        } else {
          // Fallback to existing width/height attributes or defaults
          const existingWidth = svgElement.getAttribute("width");
          const existingHeight = svgElement.getAttribute("height");

          finalWidth =
            finalWidth || (existingWidth ? parseFloat(existingWidth) : 800);
          finalHeight =
            finalHeight || (existingHeight ? parseFloat(existingHeight) : 600);
        }
      }

      // Update container size
      container.style.width = finalWidth + "px";
      container.style.height = finalHeight + "px";

      // Configure the SVG element
      svgElement.setAttribute("width", finalWidth.toString());
      svgElement.setAttribute("height", finalHeight.toString());
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      // Apply styles to ensure proper text rendering
      svgElement.style.fontFamily = "Arial, sans-serif";
      svgElement.style.fontSize = "14px";

      // Process all text elements to ensure they render properly
      const processTextElements = () => {
        const textElements = svgElement.querySelectorAll("text, tspan");
        textElements.forEach((element) => {
          // Ensure font properties are set
          if (!element.getAttribute("font-family")) {
            element.setAttribute("font-family", "Arial, sans-serif");
          }
          if (!element.getAttribute("font-size")) {
            element.setAttribute("font-size", "14");
          }

          // Apply inline styles as well
          const textEl = element as SVGTextElement;
          textEl.style.fontFamily = "Arial, sans-serif";
          textEl.style.fontSize = "14px";

          // Ensure text is visible
          if (!element.getAttribute("fill")) {
            element.setAttribute("fill", "black");
          }
        });

        // Process spans and other text containers
        const gElements = svgElement.querySelectorAll("g");
        gElements.forEach((g) => {
          if (g.querySelector("text")) {
            g.style.fontFamily = "Arial, sans-serif";
            g.style.fontSize = "14px";
          }
        });
      };

      processTextElements();

      // Force a reflow to ensure styles are applied
      svgElement.getBoundingClientRect();

      // Wait a bit for font loading and rendering
      setTimeout(() => {
        try {
          // Get the final SVG after all processing
          const serializer = new XMLSerializer();
          const serializedSvg = serializer.serializeToString(svgElement);

          // Create the canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { alpha: false });

          if (!ctx) {
            document.body.removeChild(container);
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Setup canvas for high quality rendering
          const scale = window.devicePixelRatio || 1;
          canvas.width = finalWidth * scale;
          canvas.height = finalHeight * scale;
          canvas.style.width = finalWidth + "px";
          canvas.style.height = finalHeight + "px";
          ctx.scale(scale, scale);

          // Configure context
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.textBaseline = "alphabetic";

          // Load and draw the image
          const img = new Image();
          img.onload = () => {
            try {
              // Fill background
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, finalWidth, finalHeight);

              // Draw the SVG
              ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

              // Convert to PNG
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

          // Create data URL
          const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            serializedSvg
          )}`;
          img.src = dataUrl;
        } catch (error) {
          document.body.removeChild(container);
          reject(error);
        }
      }, 200); // Longer delay to ensure complete rendering
    } catch (error) {
      document.body.removeChild(container);
      reject(error);
    }
  });
};

/**
 * Copy PNG data to clipboard
 */
export const copyPngToClipboard = async (pngDataUrl: string): Promise<void> => {
  try {
    // Convert data URL to blob
    const response = await fetch(pngDataUrl);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
  } catch (error) {
    console.error("Failed to copy PNG to clipboard:", error);
    throw new Error("Failed to copy diagram to clipboard");
  }
};

/**
 * Render Mermaid diagram and copy as PNG to clipboard
 */
export const renderAndCopyMermaidAsPng = async (
  id: string,
  diagramText: string,
  width?: number,
  height?: number
): Promise<void> => {
  const { svg } = await renderMermaidToSvg(id, diagramText);
  const pngDataUrl = await convertMermaidSvgToPng(svg, width, height);
  await copyPngToClipboard(pngDataUrl);
};
