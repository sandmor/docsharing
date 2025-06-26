"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const trpc = useTRPC();
  const documents = useQuery(
    trpc.document.getAllDocumentsForUser.queryOptions()
  );

  const documentList = documents.data || [];

  return (
    <aside className="w-64 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <ul className="space-y-2">
          {documentList.map((doc) => (
            <li key={doc.id}>
              <a
                href={`/documents/${doc.id}`}
                className="block p-2 rounded hover:bg-gray-100"
              >
                {doc.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
