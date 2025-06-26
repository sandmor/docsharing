"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { codeTheme } from "@/lib/code-theme";
import { Copy, Eye, Code } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import { SVGViewer } from "./svg-viewer";
import { renderAndCopyMermaidAsPng, renderMermaidToSvg } from "@/lib/mermaid";
import { useId, useState, useEffect } from "react";

interface TopBarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
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
    </div>
  );

  const renderContent = () => {
    if (isMermaid && showDiagram) {
      if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
      }
      if (svgContent) {
        return <SVGViewer id={id} svgContent={svgContent} />;
      }
      return <div className="p-4">Rendering diagram...</div>;
    }

    return (
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
