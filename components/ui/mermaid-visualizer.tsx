"use client";

import { useId, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SVGViewer } from "./svg-viewer";
import { renderMermaidToSvg } from "@/lib/mermaid";

interface MermaidVisualizerProps {
  value: string;
  children: React.ReactNode;
  onDiagramRendered: (svgContent: string) => void;
  onDiagramError: (error: string) => void;
  isDiagramVisible: boolean;
}

const MermaidLoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center p-8 space-y-6"
    style={{ willChange: "transform" }}
  >
    {/* Simple pulsing icon */}
    <motion.div
      className="relative w-16 h-16 border-2 border-blue-200 rounded-lg flex items-center justify-center bg-blue-50"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ willChange: "transform" }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-500"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Single pulse ring */}
      <motion.div
        className="absolute inset-0 border-2 border-blue-300 rounded-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{ willChange: "transform, opacity" }}
      />
    </motion.div>

    {/* Simple text */}
    <div className="text-sm text-muted-foreground font-medium">
      Rendering diagram...
    </div>

    {/* Optimized progress bar */}
    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-500 rounded-full"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          willChange: "transform",
          width: "50%",
        }}
      />
    </div>
  </motion.div>
);

// Error state component
const MermaidErrorIndicator = ({ error }: { error: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center p-8 space-y-4"
  >
    <motion.div
      className="w-16 h-16 border-2 border-red-200 rounded-lg flex items-center justify-center bg-red-50"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        className="text-red-500"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <line
          x1="15"
          y1="9"
          x2="9"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="9"
          y1="9"
          x2="15"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
    <div className="text-sm text-red-500 text-center">{error}</div>
  </motion.div>
);

export const MermaidVisualizer = ({
  value,
  children,
  onDiagramRendered,
  onDiagramError,
  isDiagramVisible,
}: MermaidVisualizerProps) => {
  const id = useId();
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDiagramVisible) {
      setIsRendering(true);
      renderMermaidToSvg(id, value)
        .then(({ svg }) => {
          setSvgContent(svg);
          setError(null);
          setIsRendering(false);
          onDiagramRendered(svg);
        })
        .catch((err) => {
          console.error("Mermaid rendering error:", err);
          const errorMessage = "Failed to render Mermaid diagram.";
          setError(errorMessage);
          setIsRendering(false);
          onDiagramError(errorMessage);
        });
    }
  }, [id, value, isDiagramVisible, onDiagramRendered, onDiagramError]);

  useEffect(() => {
    if (codeRef.current) {
      const height = codeRef.current.getBoundingClientRect().height;
      if (height > 0 && height !== contentHeight) {
        setContentHeight(height);
      }
    }
  }, [codeRef.current, value, isDiagramVisible]);

  return (
    <>
      <div
        ref={codeRef}
        style={{
          position: isDiagramVisible ? "absolute" : "static",
          left: isDiagramVisible ? "-9999px" : "auto",
          width: "100%",
          overflow: "auto",
        }}
      >
        {children}
      </div>

      {isDiagramVisible && (
        <div style={{ height: contentHeight ? `${contentHeight}px` : "auto" }}>
          <AnimatePresence mode="wait">
            {error ? (
              <MermaidErrorIndicator key="error" error={error} />
            ) : isRendering ? (
              <MermaidLoadingIndicator key="loading" />
            ) : svgContent ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <SVGViewer id={id} svgContent={svgContent} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};
