"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderMermaidToSvg } from "@/lib/mermaid";
import { Button } from "./button";

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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const originalViewBoxRef = useRef<string>("");
  const uniqueId = `mermaid-${id}`;

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 1 / 1.5);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(zoomRef.current.transform, d3.zoomIdentity)
      .on("end", () => {
        // Reset viewBox to original
        svg.attr("viewBox", originalViewBoxRef.current);
      });
  };

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !diagramText) return;

      try {
        const { svg } = await renderMermaidToSvg(id, diagramText);
        if (containerRef.current) {
          // Set the SVG content
          containerRef.current.innerHTML = svg;

          // Get the SVG element and store reference
          const svgElement = containerRef.current.querySelector(
            "svg"
          ) as SVGSVGElement;
          if (svgElement) {
            svgRef.current = svgElement;
            setupPanZoom();
          }
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div class="text-red-500 flex items-center justify-center h-full">Diagram rendering error</div>';
        }
      }
    };

    const setupPanZoom = () => {
      if (!svgRef.current || !containerRef.current) return;

      const svg = d3.select(svgRef.current);

      // Clear any existing zoom behavior
      svg.on(".zoom", null);

      // Get the original viewBox or create one based on the SVG's bounding box
      let originalViewBox = svgRef.current.getAttribute("viewBox");
      let viewBoxValues: number[];

      if (originalViewBox) {
        viewBoxValues = originalViewBox.split(" ").map(Number);
      } else {
        // If no viewBox, create one from the SVG content
        const bbox = svgRef.current.getBBox();
        viewBoxValues = [bbox.x, bbox.y, bbox.width, bbox.height];
        originalViewBox = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;
        svgRef.current.setAttribute("viewBox", originalViewBox);
      }

      // Store original viewBox for reset functionality
      originalViewBoxRef.current = originalViewBox;

      // Set SVG to fill container
      svg
        .attr("width", "100%")
        .attr("height", "100%")
        .style("display", "block");

      // Create zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => {
          const { transform } = event;

          // Apply transform to the entire SVG content by modifying the viewBox
          const [origX, origY, origWidth, origHeight] = viewBoxValues;

          // Calculate new viewBox based on zoom transform
          const newX = origX - transform.x / transform.k;
          const newY = origY - transform.y / transform.k;
          const newWidth = origWidth / transform.k;
          const newHeight = origHeight / transform.k;

          svg.attr("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`);
        });

      // Store zoom behavior for external control
      zoomRef.current = zoom;

      // Apply zoom behavior to SVG
      svg.call(zoom);

      // Add double-click to reset zoom
      svg.on("dblclick.zoom", () => {
        handleReset();
      });

      // Set cursor styles
      svg
        .style("cursor", "grab")
        .on("mousedown.cursor", function () {
          d3.select(this).style("cursor", "grabbing");
        })
        .on("mouseup.cursor mouseleave.cursor", function () {
          d3.select(this).style("cursor", "grab");
        });

      // Prevent text selection during pan
      svg.style("user-select", "none");
    };

    renderMermaid();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      svgRef.current = null;
    };
  }, [diagramText, id]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={cn(
          "w-full min-h-[200px] h-full overflow-hidden",
          "border border-gray-200 rounded-md bg-white",
          className
        )}
        id={uniqueId}
      />

      {/* Floating Action Buttons */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm"
          onClick={handleReset}
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
