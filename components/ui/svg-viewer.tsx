"use client";

import { useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SVGViewerProps {
  id: string;
  svgContent: string;
  className?: string;
}

export const SVGViewer = memo(
  ({ id, svgContent, className }: SVGViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
      null
    );
    const uniqueId = `svg-viewer-${id}`;

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
        .call(zoomRef.current.transform, d3.zoomIdentity);
    };

    useEffect(() => {
      const setupPanZoom = () => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.on(".zoom", null); // Clear existing zoom behavior

        // Wrap all SVG children in a <g> element
        const g = svg.append("g");
        // Move all children of SVG into the new <g>
        const svgNode = svg.node();
        const gNode = g.node();
        if (svgNode && gNode) {
          while (svgNode.firstChild && svgNode.firstChild !== gNode) {
            gNode.appendChild(svgNode.firstChild);
          }
        }

        // Set SVG to fill container
        svg
          .attr("width", "100%")
          .attr("height", "100%")
          .style("display", "block");

        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 5])
          .on("start", (event) => {
            event.sourceEvent?.stopPropagation();
          })
          .on("zoom", (event) => {
            event.sourceEvent?.stopPropagation();
            g.attr("transform", event.transform.toString());
          })
          .on("end", (event) => {
            event.sourceEvent?.stopPropagation();
          });

        zoomRef.current = zoom;
        svg.call(zoom);

        // Double-click to reset zoom
        svg.on("dblclick.zoom", () => {
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
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

        svg.style("user-select", "none");
      };

      if (!containerRef.current || !svgContent) return;

      // Set the SVG content
      containerRef.current.innerHTML = svgContent;

      // Get the SVG element and store reference
      const svgElement = containerRef.current.querySelector(
        "svg"
      ) as SVGSVGElement;
      if (svgElement) {
        svgRef.current = svgElement;
        setupPanZoom();
      }

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        svgRef.current = null;
      };
    }, [svgContent, id]);

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
  }
);
SVGViewer.displayName = "SVGViewer";
