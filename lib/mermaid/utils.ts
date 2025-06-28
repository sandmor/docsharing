export const generateRequestId = (id: string): string =>
  `${id}-${Math.random().toString(36).substring(2, 11)}`;

export const createOffscreenElement = (tag: string = "div"): HTMLElement => {
  const element = document.createElement(tag);
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.top = "-9999px";
  element.style.width = "1px";
  element.style.height = "1px";
  element.style.border = "none";
  element.style.opacity = "0";
  element.style.pointerEvents = "none";
  return element;
};

export const extractDimensions = (
  svgElement: SVGSVGElement,
  fallbackWidth = 800,
  fallbackHeight = 600
) => {
  const viewBox = svgElement.getAttribute("viewBox");
  if (viewBox) {
    const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(Number);
    return {
      width: vbWidth || fallbackWidth,
      height: vbHeight || fallbackHeight,
    };
  }

  const existingWidth = svgElement.getAttribute("width");
  const existingHeight = svgElement.getAttribute("height");

  return {
    width: existingWidth ? parseFloat(existingWidth) : fallbackWidth,
    height: existingHeight ? parseFloat(existingHeight) : fallbackHeight,
  };
};
