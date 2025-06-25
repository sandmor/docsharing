"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { useCallback } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Editor() {
  const trpc = useTRPC();
  const setDocumentMutation = useMutation(
    trpc.document.setDocument.mutationOptions()
  );
  const { documentId, title, markdownContent } = useEditorStore();

  const saveDocument = useCallback(async () => {
    if (!documentId) {
      console.error("No document ID set.");
      return;
    }
    try {
      await setDocumentMutation.mutateAsync({
        id: documentId,
        title: title,
        content: markdownContent,
      });
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document.");
    }
  }, [setDocumentMutation]);

  return (
    <Button onClick={saveDocument} disabled={setDocumentMutation.isPending}>
      <Save />
    </Button>
  );
}
