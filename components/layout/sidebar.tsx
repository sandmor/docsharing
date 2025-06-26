"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "lucide-react";
import { toast } from "sonner";

export default function Sidebar() {
  const trpc = useTRPC();
  const documents = useQuery(
    trpc.document.getAllDocumentsForUser.queryOptions()
  );

  const documentList = documents.data || [];

  const handleShareClick = async (docId: string) => {
    const shareUrl = `${window.location.origin}/viewer/${docId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      toast.error("Failed to copy link");
    }
  };

  return (
    <aside className="w-64 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <ul className="space-y-2">
          {documentList.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center group rounded hover:bg-gray-100 p-2"
            >
              <a href={`/documents/${doc.id}`} className="flex-1 block">
                {doc.title}
              </a>
              <button
                onClick={() => handleShareClick(doc.id)}
                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy shareable link"
              >
                <Link className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
