"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useEffect } from "react";
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
    refetchOnMount: false,
  });
  const title = document?.title || "";
  const initialContent = document?.content || "";

  const { setDocumentId, setTitle, setMarkdownContent, updateSavedState } =
    useEditorStore();

  useEffect(() => {
    setDocumentId(documentId);
    if (title) {
      setTitle(title);
    }
    if (initialContent) {
      setMarkdownContent(initialContent);
    }
    updateSavedState({
      title,
      markdownContent: initialContent,
    });
  }, [documentId, setDocumentId]);

  useEffect(() => {
    if (title) {
      setTitle(title);
    }
    updateSavedState((prev) => ({
      ...prev,
      title,
    }));
  }, [title]);

  return (
    <div className="flex-1 flex flex-col">
      <ContentEditor initialContent={initialContent} />
      <AutoSaveObserver />
    </div>
  );
}
