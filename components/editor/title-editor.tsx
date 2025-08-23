"use client";

import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export default function TitleEditor() {
  const { currentState, setTitle, documentId, isInitializing } = useEditorStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isInitializing) return; // ignore during init
      const newTitle = e.target.value;
      setTitle(newTitle);

      // Update the documents list cache optimistically
      if (documentId) {
        const queryKey =
          trpc.document.getAllDocumentsForUser.queryOptions().queryKey;
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;

          const docIndex = oldData.findIndex((doc) => doc.id === documentId);
          if (docIndex === -1) return oldData;

          const updatedDoc = { ...oldData[docIndex], title: newTitle };

          // Move the updated document to the front of the list
          return [
            updatedDoc,
            ...oldData.slice(0, docIndex),
            ...oldData.slice(docIndex + 1),
          ];
        });
      }
    },
    [setTitle, documentId, trpc, queryClient, isInitializing]
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
