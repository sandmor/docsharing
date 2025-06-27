"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eraser, Link as LinkIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "../confirmation-dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SidebarProps {
  currentDocumentId?: string;
}

export default function Sidebar({ currentDocumentId }: SidebarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const documents = useQuery(
    trpc.document.getAllDocumentsForUser.queryOptions()
  );
  const newDocumentMutation = useMutation(
    trpc.document.newDocument.mutationOptions()
  );
  const deleteDocumentMutation = useMutation(
    trpc.document.deleteDocument.mutationOptions()
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    title: string;
    id: string;
  } | null>(null);

  const documentList = documents.data || [];

  const handleShareClick = useCallback(async (docId: string) => {
    const shareUrl = `${window.location.origin}/viewer/${docId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      toast.error("Failed to copy link");
    }
  }, []);

  const handleNewDocument = useCallback(() => {
    newDocumentMutation.mutate(undefined, {
      onSuccess: (newDoc) => {
        toast.success("New document created");
        router.push(`/documents/${newDoc.id}`);
      },
      onError: () => {
        toast.error("Failed to create new document");
      },
    });
  }, [newDocumentMutation]);

  const handleDeleteClick = useCallback((docId: string, docTitle: string) => {
    setItemToDelete({ title: docTitle, id: docId });
    setIsDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    deleteDocumentMutation.mutate(
      { id: itemToDelete.id },
      {
        onSuccess: () => {
          toast.success(`Document "${itemToDelete.title}" deleted`);
          if (currentDocumentId === itemToDelete.id) {
            router.push("/documents");
          }
          const queryKey =
            trpc.document.getAllDocumentsForUser.queryOptions().queryKey;
          queryClient.setQueryData(queryKey, (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.filter((doc: any) => doc.id !== itemToDelete.id);
          });
          setIsDialogOpen(false);
          setItemToDelete(null);
        },
        onError: () => {
          toast.error(`Failed to delete document "${itemToDelete.title}"`);
          setIsDialogOpen(false);
          setItemToDelete(null);
        },
      }
    );
  }, [itemToDelete, deleteDocumentMutation, documents]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {documentList.map((doc) => (
              <motion.li
                key={doc.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center group rounded hover:bg-gray-100",
                  {
                    "bg-gray-200": doc.id === currentDocumentId,
                  }
                )}
              >
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex-1 block p-2"
                >
                  {doc.title}
                </Link>
                <button
                  onClick={() => handleDeleteClick(doc.id, doc.title)}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Delete document"
                >
                  <Eraser className="h-4 w-4 text-gray-500 hover:text-red-600" />
                </button>
                <button
                  onClick={() => handleShareClick(doc.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Copy shareable link"
                >
                  <LinkIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDialog}
          variant="destructive"
          title="Delete Document"
          description={`Are you sure you want to delete ${itemToDelete?.title}? This action cannot be undone.`}
          cancelText="Cancel"
          confirmText="Delete"
        />
      </div>
      <div className="p-4 border-t border-gray-200">
        <Button onClick={handleNewDocument} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add a document
        </Button>
      </div>
    </div>
  );
}
