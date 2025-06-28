"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { codeTheme } from "@/lib/code-theme";
import { Copy, Eye, Code, Download, PenTool, Image } from "lucide-react";
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
import { motion, AnimatePresence } from "motion/react";

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

const MermaidLoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center p-8 space-y-6"
    style={{ willChange: "transform" }}
  >
    {/* Simple pulsing icon */}
    <motion.div
      className="relative w-16 h-16 border-2 border-blue-200 rounded-lg flex items-center justify-center bg-blue-50"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ willChange: "transform" }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-500"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Single pulse ring */}
      <motion.div
        className="absolute inset-0 border-2 border-blue-300 rounded-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{ willChange: "transform, opacity" }}
      />
    </motion.div>

    {/* Simple text */}
    <div className="text-sm text-muted-foreground font-medium">
      Rendering diagram...
    </div>

    {/* Optimized progress bar */}
    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-500 rounded-full"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          willChange: "transform",
          width: "50%",
        }}
      />
    </div>
  </motion.div>
);

// Error state component
const MermaidErrorIndicator = ({ error }: { error: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center p-8 space-y-4"
  >
    <motion.div
      className="w-16 h-16 border-2 border-red-200 rounded-lg flex items-center justify-center bg-red-50"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        className="text-red-500"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <line
          x1="15"
          y1="9"
          x2="9"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="9"
          y1="9"
          x2="15"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
    <div className="text-sm text-red-500 text-center">{error}</div>
  </motion.div>
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
  const [isRendering, setIsRendering] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const isMermaid = language === "mermaid";

  useEffect(() => {
    if (isMermaid && showDiagram) {
      setIsRendering(true);
      renderMermaidToSvg(id, value)
        .then(({ svg }) => {
          setSvgContent(svg);
          setError(null);
          setIsRendering(false);
        })
        .catch((err) => {
          console.error("Mermaid rendering error:", err);
          setError("Failed to render Mermaid diagram.");
          setIsRendering(false);
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
            <DropdownMenuItem
              onClick={() => handleDownloadPng()}
              disabled={isRendering}
            >
              <Image className="mr-2 h-4 w-4" />
              Download PNG
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDownloadSvg()}
              disabled={isRendering}
            >
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
            <AnimatePresence mode="wait">
              {error ? (
                <MermaidErrorIndicator key="error" error={error} />
              ) : isRendering ? (
                <MermaidLoadingIndicator key="loading" />
              ) : svgContent ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <SVGViewer id={id} svgContent={svgContent} />
                </motion.div>
              ) : null}
            </AnimatePresence>
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
