"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import debounce from "lodash.debounce";

export default function Editor() {
  const trpc = useTRPC();
  const setDocumentMutation = useMutation(
    trpc.document.setDocument.mutationOptions()
  );
  const { documentId, currentState, isSaved, saveCurrentState } =
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
        await setDocumentMutation.mutateAsync({
          id: documentId,
          title: currentState.title,
          content: currentState.markdownContent,
        });
        saveCurrentState();
        if (reportSuccess) {
          toast.success("Document saved successfully!");
        }
      } catch (error) {
        console.error("Error saving document:", error);
        toast.error("Failed to save document.");
      }
    },
    [setDocumentMutation]
  );

  useEffect(() => {
    if (!isSaved) {
      debounce(() => {
        saveDocument(false);
      }, 1000)();
    }
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
