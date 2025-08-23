"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useEffect, useRef, useState } from "react";
import ContentEditor from "./content-editor";
import AutoSaveObserver from "@/components/editor/auto-save-observer";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface EditorProps {
  documentId: string;
}

export default function Editor({ documentId }: EditorProps) {
  const trpc = useTRPC();
  const { data: document } = useQuery({
    ...trpc.document.getById.queryOptions({ id: documentId }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    beginDocumentSwitch,
    applyInitialContent,
    loadVersion,
    documentId: activeId,
  } = useEditorStore();
  const [localVersion, setLocalVersion] = useState<number | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);

  // Begin switch when docId param changes
  useEffect(() => {
    const v = beginDocumentSwitch(documentId);
    setLocalVersion(v);
  }, [documentId, beginDocumentSwitch]);

  // Apply server-fetched data (guarded by version)
  useEffect(() => {
    if (!document || localVersion == null) return;
    applyInitialContent({
      documentId,
      version: localVersion,
      title: document.title || "",
      markdownContent: document.content || "",
    });
  }, [document, localVersion, applyInitialContent, documentId]);

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-auto"
      ref={scrollerRef}
    >
      <ContentEditor
        key={`${documentId}:${loadVersion}`}
        documentId={documentId}
        initialContent={document?.content || ""}
        scrollerRef={scrollerRef}
      />
      <AutoSaveObserver />
    </div>
  );
}
