export class IframeTemplateLoader {
  private static cachedTemplate: string | null = null;

  static async loadTemplate(
    templatePath: string = "/mermaid-iframe.html"
  ): Promise<string> {
    if (IframeTemplateLoader.cachedTemplate) {
      return IframeTemplateLoader.cachedTemplate;
    }

    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(
          `Failed to load iframe template from ${templatePath}: ${response.statusText}`
        );
      }
      IframeTemplateLoader.cachedTemplate = await response.text();
      return IframeTemplateLoader.cachedTemplate;
    } catch (error) {
      throw new Error(`Failed to load mermaid iframe template: ${error}`);
    }
  }

  static injectConfig(template: string, config: any): string {
    const configScript = `<script>window.MERMAID_CONFIG = ${JSON.stringify(
      config
    )};</script>`;
    return template.replace("<head>", `<head>${configScript}`);
  }
}
