"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";

interface MermaidDiagramProps {
  id: string;
  children: string;
  className?: string;
  theme?: "default" | "neutral" | "dark" | "forest" | "base";
}

export const MermaidDiagram = ({
  id,
  children: diagramText,
  className,
  theme = "default",
}: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = `mermaid-${id}`;

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      logLevel: 5,
      flowchart: {
        htmlLabels: true,
        curve: "basis",
      },
    });
  }, [theme]);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !diagramText) return;

      try {
        const { svg } = await mermaid.render(
          `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`,
          diagramText
        );
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div class="text-red-500 flex items-center justify-center h-full">Diagram rendering error</div>';
        }
      }
    };

    renderMermaid();
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [diagramText, theme, id]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full min-h-[200px] overflow-auto p-4",
        "flex items-center justify-center",
        className
      )}
      id={uniqueId}
    />
  );
};
