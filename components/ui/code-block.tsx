"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { codeTheme } from "@/lib/code-theme";
import { Copy } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

interface CodeBlockProps {
  language: string;
  value: string;
}

const formatLanguageName = (language: string): string => {
  const acronyms = ["CSS", "HTML", "JSON", "XML", "YAML", "SQL", "PHP"];
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
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!");
  };

  const displayName = formatLanguageName(language);

  return (
    <div className="rounded-md border bg-card text-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-muted-foreground">{displayName}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="rounded-full"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy code</TooltipContent>
        </Tooltip>
      </div>
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
  );
};
