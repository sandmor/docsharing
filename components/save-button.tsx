"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Editor() {
  const trpc = useTRPC();
  const setDocumentMutation = useMutation(
    trpc.document.setDocument.mutationOptions()
  );
  const { documentId, currentState, isSaved, updateSavedState } =
    useEditorStore();

  const saveDocument = useCallback(
    async (reportSuccess: boolean) => {
      if (!documentId) {
        console.error("No document ID set.");
        return;
      }
      if (isSaved) {
        return;
      }
      try {
        const stateToSave = {
          ...currentState,
        };
        await setDocumentMutation.mutateAsync({
          id: documentId,
          title: stateToSave.title,
          content: stateToSave.markdownContent,
        });
        updateSavedState(stateToSave);
        if (reportSuccess) {
          toast.success("Document saved successfully!");
        }
      } catch (error) {
        console.error("Error saving document:", error);
        toast.error("Failed to save document.");
      }
    },
    [documentId, isSaved, setDocumentMutation, updateSavedState, currentState]
  );

  useEffect(() => {
    if (isSaved) {
      return;
    }
    const handler = setTimeout(() => {
      saveDocument(false);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [isSaved, saveDocument]);

  return (
    <Button
      onClick={() => saveDocument(true)}
      disabled={isSaved || setDocumentMutation.isPending}
    >
      <Save />
    </Button>
  );
}
