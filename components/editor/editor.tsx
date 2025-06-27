"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useEffect } from "react";
import ContentEditor from "./content-editor";
import AutoSaveObserver from "@/components/editor/auto-save-observer";

interface EditorProps {
  documentId: string;
  initialTitle?: string;
  initialContent?: string;
}

export default function Editor({
  documentId,
  initialTitle,
  initialContent,
}: EditorProps) {
  const { setDocumentId, setTitle, setMarkdownContent, updateSavedState } =
    useEditorStore();

  useEffect(() => {
    setDocumentId(documentId);
    if (initialTitle) {
      setTitle(initialTitle);
    }
    if (initialContent) {
      setMarkdownContent(initialContent);
    }
    updateSavedState({
      title: initialTitle || "",
      markdownContent: initialContent || "",
    });
  }, [documentId, setDocumentId]);

  return (
    <div className="flex-1 flex flex-col">
      <ContentEditor initialContent={initialContent} />
      <AutoSaveObserver />
    </div>
  );
}
