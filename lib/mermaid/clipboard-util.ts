export class ClipboardUtil {
  static async copyPngToClipboard(pngDataUrl: string): Promise<void> {
    try {
      const response = await fetch(pngDataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (error) {
      console.error("Failed to copy PNG to clipboard:", error);
      throw new Error("Failed to copy diagram to clipboard");
    }
  }
}
