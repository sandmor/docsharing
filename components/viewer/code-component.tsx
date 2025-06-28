"use client";

import {
  CodeBlock,
  formatLanguageName,
  TopBarButton,
} from "@/components/ui/code-block";
import { CodeRenderer } from "@/components/ui/code-renderer";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { MermaidCodeComponent } from "./mermaid-code-component";

interface CodeComponentProps {
  language: string;
  value: string;
}

export const CodeComponent = ({ language, value }: CodeComponentProps) => {
  const isMermaid = language === "mermaid";
  const displayName = formatLanguageName(language);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!");
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
        icon={<Copy className="h-4 w-4" />}
        onClick={handleCopy}
        tooltip="Copy code"
      />
      <TopBarButton
        icon={<Download className="h-4 w-4" />}
        onClick={handleDownloadCode}
        tooltip={`Download ${displayName} code`}
      />
    </div>
  );

  if (isMermaid) {
    return <MermaidCodeComponent language={language} value={value} />;
  }

  return (
    <CodeBlock language={language} topbarButtons={topbarButtons}>
      <CodeRenderer language={language} value={value} />
    </CodeBlock>
  );
};
