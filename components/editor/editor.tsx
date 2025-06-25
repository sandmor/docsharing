"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useEffect } from "react";
import ContentEditor from "./content-editor";
import TitleEditor from "./title-editor";

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
  const { setDocumentId, setTitle, setMarkdownContent, saveCurrentState } =
    useEditorStore();

  useEffect(() => {
    setDocumentId(documentId);
    if (initialTitle) {
      setTitle(initialTitle);
    }
    if (initialContent) {
      setMarkdownContent(initialContent);
    }
    saveCurrentState();
  }, [documentId, setDocumentId]);

  return (
    <div>
      <TitleEditor initialTitle={initialTitle} />
      <ContentEditor initialContent={initialContent} />
    </div>
  );
}
