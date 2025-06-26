"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { codeTheme } from "@/lib/code-theme";
import { Copy, Eye, Code, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import { SVGViewer } from "./svg-viewer";
import {
  renderAndCopyMermaidAsPng,
  renderMermaidToSvg,
  convertMermaidSvgToPng,
} from "@/lib/mermaid";
import { useId, useState, useEffect, useRef } from "react";

interface TopBarButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip: string;
}

const TopBarButton = ({ icon, onClick, tooltip }: TopBarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="rounded-full"
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

interface CodeBlockProps {
  language: string;
  value: string;
}

const formatLanguageName = (language: string): string => {
  const acronyms = ["CSS", "HTML", "JSON", "XML", "TOML", "YAML", "SQL", "PHP"];
  if (acronyms.includes(language.toUpperCase())) {
    return language.toUpperCase();
  }
  if (language.endsWith("script")) {
    const prefix = language.slice(0, -6);
    if (!prefix) return "Script";
    return prefix.charAt(0).toUpperCase() + prefix.slice(1) + "Script";
  }
  return language.charAt(0).toUpperCase() + language.slice(1);
};

export const CodeBlock = ({ language, value }: CodeBlockProps) => {
  const id = useId();
  const [showDiagram, setShowDiagram] = useState(true);
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  const isMermaid = language === "mermaid";

  useEffect(() => {
    if (isMermaid && showDiagram) {
      renderMermaidToSvg(id, value)
        .then(({ svg }) => {
          setSvgContent(svg);
          setError(null);
        })
        .catch((err) => {
          console.error("Mermaid rendering error:", err);
          setError("Failed to render Mermaid diagram.");
        });
    }
  }, [id, value, isMermaid, showDiagram]);

  useEffect(() => {
    if (codeRef.current) {
      const height = codeRef.current.getBoundingClientRect().height;
      if (height > 0 && height !== contentHeight) {
        setContentHeight(height);
      }
    }
  }, [codeRef.current, value, showDiagram]);

  const handleCopy = async () => {
    if (isMermaid && showDiagram) {
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
    if (isMermaid && svgContent) {
      try {
        const pngDataUrl = await convertMermaidSvgToPng(svgContent);
        const a = document.createElement("a");
        a.href = pngDataUrl;
        a.download = `mermaid-diagram-${id}.png`;
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
    if (isMermaid && svgContent) {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mermaid-diagram-${id}.svg`;
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
    a.download = `${language}-code-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${displayName} code downloaded successfully!`);
  };

  const displayName = formatLanguageName(language);

  const topBarButtons = (
    <div className="flex items-center gap-1">
      {isMermaid && (
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
      )}
      <TopBarButton
        icon={<Copy className="h-4 w-4" />}
        onClick={handleCopy}
        tooltip={isMermaid && showDiagram ? "Copy diagram as PNG" : "Copy code"}
      />
      {isMermaid ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Download options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownloadPng()}>
              Download PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadSvg()}>
              Download SVG
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDownloadCode()}>
              Download Mermaid code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <TopBarButton
          icon={<Download className="h-4 w-4" />}
          onClick={handleDownloadCode}
          tooltip={`Download ${displayName} code`}
        />
      )}
    </div>
  );

  const renderContent = () => {
    return (
      <>
        <div
          ref={codeRef}
          style={{
            position: isMermaid && showDiagram ? "absolute" : "static",
            left: isMermaid && showDiagram ? "-9999px" : "auto",
            width: "100%",
            overflow: "auto",
          }}
        >
          <SyntaxHighlighter
            style={codeTheme as any}
            language={language}
            PreTag="div"
            customStyle={{
              backgroundColor: "transparent",
              padding: "1rem",
              margin: "0",
              border: "none",
            }}
          >
            {value}
          </SyntaxHighlighter>
        </div>

        {isMermaid && showDiagram && (
          <div
            style={{ height: contentHeight ? `${contentHeight}px` : "auto" }}
          >
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : svgContent ? (
              <SVGViewer id={id} svgContent={svgContent} />
            ) : (
              <div className="p-4">Rendering diagram...</div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="rounded-md border bg-card text-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-muted-foreground">{displayName}</span>
        {topBarButtons}
      </div>
      {renderContent()}
    </div>
  );
};
