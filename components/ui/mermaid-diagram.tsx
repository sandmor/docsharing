"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { initializeMermaid, renderMermaidToSvg } from "@/lib/mermaid";

interface MermaidDiagramProps {
  id: string;
  children: string;
  className?: string;
}

export const MermaidDiagram = ({
  id,
  children: diagramText,
  className,
}: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = `mermaid-${id}`;

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !diagramText) return;

      try {
        const { svg } = await renderMermaidToSvg(id, diagramText);
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
  }, [diagramText, id]);

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
