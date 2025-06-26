import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Input } from "../ui/input";
import { useCallback, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

interface TitleEditorProps {
  initialTitle?: string;
  documentId?: string;
}

export default function TitleEditor({
  initialTitle,
  documentId,
}: TitleEditorProps) {
  const setTitleAction = useEditorStore((state) => state.setTitle);
  const [title, setTitle] = useState(initialTitle || "");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      setTitleAction(newTitle);

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
    [setTitle, setTitleAction, documentId, trpc, queryClient]
  );

  return (
    <Input
      value={title}
      onChange={handleChange}
      placeholder="Enter document title"
      className="mb-4"
    />
  );
}
