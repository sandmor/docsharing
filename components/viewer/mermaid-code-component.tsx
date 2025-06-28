"use client";

import { useId, useState } from "react";
import {
  CodeBlock,
  formatLanguageName,
  TopBarButton,
} from "@/components/ui/code-block";
import { CodeRenderer } from "@/components/ui/code-renderer";
import { MermaidVisualizer } from "@/components/ui/mermaid-visualizer";
import { Copy, Eye, Code, Download, PenTool, Image } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  convertMermaidSvgToPng,
  renderAndCopyMermaidAsPng,
} from "@/lib/mermaid";

interface MermaidCodeComponentProps {
  language: string;
  value: string;
}

export const MermaidCodeComponent = ({ language, value }: MermaidCodeComponentProps) => {
  const [showDiagram, setShowDiagram] = useState(true);
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const id = useId();
  const displayName = formatLanguageName(language);

  const handleCopy = async () => {
    if (showDiagram) {
      try {
        await renderAndCopyMermaidAsPng(id, value);
        toast.success("Diagram copied to clipboard as PNG!");
      } catch (error) {
        console.error("Failed to copy diagram:", error);
        toast.error("Failed to copy diagram. Copying code instead.");
        navigator.clipboard.writeText(value);
      }
    } else {
      navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownloadPng = async () => {
    if (svgContent) {
      try {
        const pngDataUrl = await convertMermaidSvgToPng(svgContent);
        const a = document.createElement("a");
        a.href = pngDataUrl;
        a.download = `mermaid-diagram.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("PNG downloaded successfully!");
      } catch (error) {
        console.error("Failed to download PNG:", error);
        toast.error("Failed to download PNG.");
      }
    }
  };

  const handleDownloadSvg = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mermaid-diagram.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("SVG downloaded successfully!");
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${language}-code.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${displayName} code downloaded successfully!`);
  };

  const topbarButtons = (
    <div className="flex items-center gap-1">
      <TopBarButton
        icon={
          showDiagram ? (
            <Code className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )
        }
        onClick={() => setShowDiagram(!showDiagram)}
        tooltip={showDiagram ? "Show code" : "Show diagram"}
      />
      <TopBarButton
        icon={<Copy className="h-4 w-4" />}
        onClick={handleCopy}
        tooltip={showDiagram ? "Copy diagram as PNG" : "Copy code"}
      />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Download options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleDownloadPng()}>
            <Image className="mr-2 h-4 w-4" />
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadSvg()}>
            <PenTool className="mr-2 h-4 w-4" />
            Download SVG
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDownloadCode()}>
            <Code className="mr-2 h-4 w-4" />
            Download code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <CodeBlock language={language} topbarButtons={topbarButtons}>
      <MermaidVisualizer
        value={value}
        onDiagramRendered={setSvgContent}
        onDiagramError={setError}
        isDiagramVisible={showDiagram}
      >
        <CodeRenderer language={language} value={value} />
      </MermaidVisualizer>
    </CodeBlock>
  );
};
