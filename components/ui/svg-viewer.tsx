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
    const gRef = useRef<SVGGElement | null>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
      null
    );
    const [isMaximized, setIsMaximized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const viewState = useRef<{ k: number; x: number; y: number } | null>(null);
    const uniqueId = `svg-viewer-${id}`;

    const applyReset = () => {
      if (!svgRef.current || !zoomRef.current) return;
      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
      setIsLocked(true);
    };

    const handleZoomIn = () => {
      if (!svgRef.current || !zoomRef.current) return;
      setIsLocked(false);
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    };

    const handleZoomOut = () => {
      if (!svgRef.current || !zoomRef.current) return;
      setIsLocked(false);
      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1 / 1.5);
    };

    const handleReset = () => {
      applyReset();
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

        const g = svg.append("g");
        gRef.current = g.node();
        while (svg.node()!.firstChild !== g.node()) {
          g.node()!.appendChild(svg.node()!.firstChild!);
        }

        svg
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("preserveAspectRatio", "xMidYMid meet")
          .style("display", "block")
          .style("width", "100%")
          .style("height", "100%")
          .style("max-width", "100%")
          .style("max-height", "100%");

        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 10])
          .on("zoom", (event) => {
            if (event.sourceEvent) {
              // This event is triggered by user interaction (wheel, drag)
              const currentTransform = event.transform;
              if (
                currentTransform.k !== 1 ||
                currentTransform.x !== 0 ||
                currentTransform.y !== 0
              ) {
                setIsLocked(false);
              }
            }
            g.attr("transform", event.transform.toString());
          });

        zoomRef.current = zoom;
        svg.call(zoom);

        if (preserveTransform && viewState.current) {
          const { k, x, y } = viewState.current;
          const transform = d3.zoomIdentity.translate(x, y).scale(k);
          svg.call(zoom.transform, transform);
          setIsLocked(k === 1 && x === 0 && y === 0);
        } else {
          svg.call(zoom.transform, d3.zoomIdentity);
          setIsLocked(true);
        }

        svg.on("dblclick.zoom", null);

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
        const originalWidth = svgElement.getAttribute("width") || "100";
        const originalHeight = svgElement.getAttribute("height") || "100";

        svgElement.removeAttribute("width");
        svgElement.removeAttribute("height");

        if (!svgElement.hasAttribute("viewBox")) {
          svgElement.setAttribute(
            "viewBox",
            `0 0 ${originalWidth} ${originalHeight}`
          );
        }

        svgRef.current = svgElement as SVGSVGElement;
        setupPanZoom(isMaximized);
      }

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        svgRef.current = null;
        gRef.current = null;
      };
    }, [svgContent, id, isMaximized]);

    useEffect(() => {
      if (isMaximized) {
        setTimeout(() => setIsVisible(true), 10);
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
            !isMaximized && "bg-white",
            className
          )}
          id={uniqueId}
          style={{ minWidth: "100%", minHeight: "100%" }}
        />

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
