"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AutoSaveObserver() {
  const trpc = useTRPC();
  const { documentId, currentState, isSaved, updateSavedState } =
    useEditorStore();

  const setDocumentMutation = useMutation({
    ...trpc.document.setDocument.mutationOptions(),
    onSuccess: (_result, variables) => {
      updateSavedState({
        title: variables.title,
        markdownContent: variables.content || "",
      });
    },
    onError: (error) => {
      console.error("Error saving document:", error);
      toast.error("Failed to save document.");
    },
  });

  // Debounced save effect
  useEffect(() => {
    if (isSaved) {
      return;
    }

    const timerId = setTimeout(() => {
      if (!documentId) {
        console.error("No document ID set.");
        return;
      }
      setDocumentMutation.mutate({
        id: documentId,
        title: currentState.title,
        content: currentState.markdownContent,
      });
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [
    currentState,
    documentId,
    isSaved,
    setDocumentMutation,
  ]);

  // Save on unload or client-side navigation
  useEffect(() => {
    const saveOnExit = () => {
      const state = useEditorStore.getState();
      if (!state.isSaved && state.documentId) {
        const url = `/api/trpc/document.setDocument?batch=1`;
        const body = {
          "0": {
            json: {
              id: state.documentId,
              title: state.currentState.title,
              content: state.currentState.markdownContent,
            },
          },
        };
        navigator.sendBeacon(url, JSON.stringify(body));
      }
    };

    window.addEventListener("beforeunload", saveOnExit);

    return () => {
      window.removeEventListener("beforeunload", saveOnExit);
      saveOnExit(); // Trigger for component unmount (i.e. client-side navigation)
    };
  }, []);

  return null;
}

