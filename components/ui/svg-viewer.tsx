"use client";

import { useEffect, useRef, memo, useState } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize } from "lucide-react";
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
    const [isMaximized, setIsMaximized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const viewState = useRef<{ k: number; x: number; y: number } | null>(null);
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

    const handleToggleMaximize = () => {
      if (svgRef.current) {
        viewState.current = d3.zoomTransform(svgRef.current);
      }
      setIsMaximized(!isMaximized);
    };

    useEffect(() => {
      const setupPanZoom = (preserveTransform = false) => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.on(".zoom", null);

        const g = svg.select("g").node()
          ? svg.select<SVGGElement>("g")
          : svg.append("g");

        if (g.selectAll("*").empty()) {
          const svgNode = svg.node();
          const gNode = g.node();
          if (svgNode && gNode) {
            while (svgNode.firstChild && svgNode.firstChild !== gNode) {
              gNode.appendChild(svgNode.firstChild);
            }
          }
        }

        svg
          .attr("width", "100%")
          .attr("height", "100%")
          .style("display", "block");

        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 10])
          .on("zoom", (event) => {
            g.attr("transform", event.transform.toString());
          });

        zoomRef.current = zoom;
        svg.call(zoom);

        // Preserve transform
        if (preserveTransform && viewState.current) {
          const { k, x, y } = viewState.current;
          const transform = d3.zoomIdentity.translate(x, y).scale(k);
          svg.call(zoom.transform, transform);
        } else {
          // Fit and center
          const gNode = g.node();
          if (!gNode) return;
          const bounds = gNode.getBBox();
          const svgNode = svg.node();
          if (!svgNode) return;
          const parent = svgNode.parentElement;
          if (bounds && parent) {
            const { width, height } = parent.getBoundingClientRect();
            const { width: bWidth, height: bHeight } = bounds;

            if (bWidth > 0 && bHeight > 0) {
              const midX = bounds.x + bWidth / 2;
              const midY = bounds.y + bHeight / 2;
              const scale = Math.min(width / bWidth, height / bHeight) * 0.9;
              const newX = width / 2 - midX * scale;
              const newY = height / 2 - midY * scale;
              const newTransform = d3.zoomIdentity
                .translate(newX, newY)
                .scale(scale);
              svg.call(zoom.transform, newTransform);
            }
          }
        }

        svg.on("dblclick.zoom", () => {
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        });

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

      containerRef.current.innerHTML = svgContent;
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        svgRef.current = svgElement as SVGSVGElement;
        // Remove the viewBox to allow the SVG to fill the container
        svgElement.removeAttribute("viewBox");
        setupPanZoom(isMaximized);
      }

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        svgRef.current = null;
      };
    }, [svgContent, id, isMaximized]);

    useEffect(() => {
      if (isMaximized) {
        setTimeout(() => setIsVisible(true), 10); // Delay for transition
      } else {
        setIsVisible(false);
      }
    }, [isMaximized]);

    return (
      <div
        className={cn(
          "relative w-full h-full transition-opacity duration-300",
          isMaximized &&
            "fixed top-0 left-0 w-screen h-screen bg-white/90 backdrop-blur-sm z-50 p-4",
          isVisible ? "opacity-100" : isMaximized ? "opacity-0" : "opacity-100"
        )}
      >
        <div
          ref={containerRef}
          className={cn(
            "w-full h-full overflow-hidden",
            !isMaximized && "border border-gray-200 rounded-md bg-white",
            className
          )}
          id={uniqueId}
        />

        {/* Floating Action Buttons */}
        <div
          className={cn(
            "absolute right-4 flex flex-col gap-2",
            isMaximized ? "top-4" : "top-1/2 -translate-y-1/2"
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur-sm"
            onClick={handleToggleMaximize}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
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
