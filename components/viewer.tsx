"use client";

import ReactMarkdown from "react-markdown";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface ViewerProps {
  docId: string;
}

export default function Viewer({ docId }: ViewerProps) {
  const trpc = useTRPC();
  const document = useQuery(trpc.document.getById.queryOptions({ id: docId }));

  if (document.isLoading) {
    return <div>Loading...</div>;
  }
  if (document.isError) {
    return <div>Error loading document</div>;
  }
  if (!document.data) {
    return <div>Document not found</div>;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{document.data.title}</h1>
      <ReactMarkdown>{document.data.content}</ReactMarkdown>
    </div>
  );
}
