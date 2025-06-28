"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import { Button } from "@/components/ui/button";

export const formatLanguageName = (language: string): string => {
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

interface TopBarButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip: string;
}

export const TopBarButton = ({ icon, onClick, tooltip }: TopBarButtonProps) => (
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
  children: React.ReactNode;
  topbarButtons: React.ReactNode;
}

export const CodeBlock = ({
  language,
  children,
  topbarButtons,
}: CodeBlockProps) => {
  return (
    <div className="rounded-md border bg-card text-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-muted-foreground">
          {formatLanguageName(language)}
        </span>
        {topbarButtons}
      </div>
      {children}
    </div>
  );
};
