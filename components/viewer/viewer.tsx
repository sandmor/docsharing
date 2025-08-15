"use client";

import ReactMarkdown from "react-markdown";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CodeComponent } from "@/components/viewer/code-component";
import { Children } from "react";

interface ViewerProps {
  docId: string;
}

export default function Viewer({ docId }: ViewerProps) {
  const trpc = useTRPC();
  const document = useQuery(trpc.document.getById.queryOptions({ id: docId }));

  const components = useMemo(
    () => ({
      code({ node, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        return match ? (
          <CodeComponent
            language={match[1]}
            value={String(children).replace(/\n$/, "")}
          />
        ) : (
          <code
            className="text-sm font-mono bg-gray-100 text-gray-800 rounded-md px-2 py-1"
            {...props}
          >
            {children}
          </code>
        );
      },
      p: ({ children }: any) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
      h1: ({ children }: any) => (
        <h1 className="text-4xl font-bold mt-10 mb-6 text-gray-900 border-b border-gray-300 pb-3">
          {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-3xl font-semibold mt-8 mb-5 text-gray-800">
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-2xl font-semibold mt-7 mb-4 text-gray-800">
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4 className="text-xl font-medium mt-6 mb-3 text-gray-700">
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5 className="text-lg font-medium mt-5 mb-3 text-gray-700">
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6 className="text-base font-medium mt-4 mb-3 text-gray-600">
          {children}
        </h6>
      ),
      ul: ({ children }: any) => (
        <ul className="list-disc list-inside mb-5 ml-6 space-y-2">
          {children}
        </ul>
      ),
      ol: ({ children }: any) => (
        <ol className="list-decimal list-inside mb-5 ml-6 space-y-2">
          {children}
        </ol>
      ),
      li: ({ children }: any) => (
        <li className="text-gray-700 leading-relaxed">{children}</li>
      ),
      hr: () => <hr className="my-10 border-gray-300" />,
      img: ({ src, alt }: any) => (
        <img
          src={src}
          alt={alt}
          className="my-6 rounded-lg shadow-md max-w-full h-auto"
        />
      ),
      a: ({ href, children }: any) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {children}
        </a>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-6">
          {children}
        </blockquote>
      ),
    }),
    []
  );

  if (document.isLoading) {
    return <p>Loading...</p>;
  }

  if (document.error) {
    return <p>Error loading document: {document.error.message}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{document.data?.title}</h1>
      <article className="prose lg:prose-xl max-w-none text-gray-700">
        <ReactMarkdown components={components}>
          {document.data?.content ?? ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}