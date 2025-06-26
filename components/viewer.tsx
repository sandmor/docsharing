"use client";

import ReactMarkdown from "react-markdown";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CodeBlock } from "./ui/code-block";
import { useMemo } from "react";

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

  const components = useMemo(
    () => ({
      code({ node, className, children, ...props }: any) {
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
      h1: ({ children }: any) => (
        <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">
          {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800">
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4 className="text-lg font-medium mt-4 mb-2 text-gray-700">
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5 className="text-base font-medium mt-3 mb-2 text-gray-700">
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6 className="text-sm font-medium mt-3 mb-2 text-gray-600">
          {children}
        </h6>
      ),
      ul: ({ children }: any) => (
        <ul className="list-disc list-inside mb-4 ml-4 space-y-1">
          {children}
        </ul>
      ),
      ol: ({ children }: any) => (
        <ol className="list-decimal list-inside mb-4 ml-4 space-y-1">
          {children}
        </ol>
      ),
      li: ({ children }: any) => (
        <li className="text-gray-700 leading-relaxed">{children}</li>
      ),
    }),
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{document.data.title}</h1>
      <ReactMarkdown components={components}>
        {document.data.content}
      </ReactMarkdown>
    </div>
  );
}
