"use client";

import ReactMarkdown from "react-markdown";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CodeBlock } from "./ui/code-block";

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
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, "")}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {document.data.content}
      </ReactMarkdown>
    </div>
  );
}
