"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export default function TitleEditor() {
  const { currentState, setTitle, documentId } = useEditorStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);

      // Update the documents list cache optimistically
      if (documentId) {
        const queryKey =
          trpc.document.getAllDocumentsForUser.queryOptions().queryKey;
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return oldData.map((doc: any) =>
            doc.id === documentId ? { ...doc, title: newTitle } : doc
          );
        });
      }
    },
    [setTitle, documentId, trpc, queryClient]
  );

  if (!currentState) {
    // The document is still loading, show nothing
    return null;
  }

  return (
    <input
      value={currentState.title}
      onChange={handleChange}
      placeholder="Enter document title"
      className="border-0 shadow-none outline-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xl font-medium placeholder:text-gray-400 w-full"
    />
  );
}
