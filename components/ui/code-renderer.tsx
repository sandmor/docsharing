"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { codeTheme } from "@/lib/code-theme";

interface CodeRendererProps {
  language: string;
  value: string;
}

export const CodeRenderer = ({ language, value }: CodeRendererProps) => {
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
