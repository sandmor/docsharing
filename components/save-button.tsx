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
  const setContentMutation = useMutation(
    trpc.document.setContent.mutationOptions()
  );
  const { markdownContent, documentId } = useEditorStore();

  const saveDocument = useCallback(async () => {
    if (!documentId) {
      console.error("No document ID set.");
      return;
    }
    try {
      await setContentMutation.mutateAsync({
        id: documentId,
        content: markdownContent,
      });
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document.");
    }
  }, [setContentMutation]);

  return (
    <Button onClick={saveDocument} disabled={setContentMutation.isPending}>
      <Save />
    </Button>
  );
}
