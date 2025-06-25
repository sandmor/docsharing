"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Textarea } from "./ui/textarea";
import { useCallback, useEffect } from "react";

interface EditorProps {
  documentId: string;
  initialContent?: string;
}

export default function Editor({ documentId, initialContent }: EditorProps) {
  const { setDocumentId, setMarkdownContent } = useEditorStore();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMarkdownContent(e.target.value);
    },
    [setMarkdownContent]
  );

  useEffect(() => {
    setDocumentId(documentId);
  }, [documentId, setDocumentId]);

  return (
    <Textarea
      defaultValue={initialContent}
      onChange={onChange}
      className="h-[500px] w-full"
    />
  );
}
