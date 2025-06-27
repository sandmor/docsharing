"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CloudDownload,
  Eraser,
  Plus,
  Share2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "../confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

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
  const renameDocumentMutation = useMutation(
    trpc.document.renameDocument.mutationOptions()
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    title: string;
    id: string;
  } | null>(null);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{
    title: string;
    id: string;
  } | null>(null);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const documentList = documents.data || [];

  const handleShareClick = useCallback(async (docId: string) => {
    const shareUrl = `${window.location.origin}/viewer/${docId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Document Share",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      toast.error("Failed to share document or copy link");
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

  const handleDownloadClick = useCallback((docId: string) => {
    const link = document.createElement("a");
    link.href = `/api/download/${docId}`;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDeleteClick = useCallback((docId: string, docTitle: string) => {
    setItemToDelete({ title: docTitle, id: docId });
    setIsDeleteDialogOpen(true);
  }, []);

  const handleRenameClick = useCallback((docId: string, docTitle: string) => {
    setItemToRename({ title: docTitle, id: docId });
    setNewDocumentTitle(docTitle);
    setIsRenameDialogOpen(true);
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
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        },
        onError: () => {
          toast.error(`Failed to delete document "${itemToDelete.title}"`);
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        },
      }
    );
  }, [itemToDelete, deleteDocumentMutation, documents]);

  const handleConfirmRename = useCallback(() => {
    if (!itemToRename) return;
    renameDocumentMutation.mutate(
      { id: itemToRename.id, title: newDocumentTitle },
      {
        onSuccess: (updatedDoc) => {
          toast.success(`Document renamed to ${updatedDoc.title}`);
          const allDocumentsQueryKey =
            trpc.document.getAllDocumentsForUser.queryOptions().queryKey;
          queryClient.setQueryData(allDocumentsQueryKey, (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((doc: any) =>
              doc.id === updatedDoc.id ? updatedDoc : doc
            );
          });
          const getByIdQueryKey = trpc.document.getById.queryOptions({
            id: updatedDoc.id,
          }).queryKey;
          queryClient.setQueryData(getByIdQueryKey, updatedDoc);
          setIsRenameDialogOpen(false);
          setItemToRename(null);
          setNewDocumentTitle("");
        },
        onError: () => {
          toast.error(`Failed to rename document ${itemToRename.title}`);
          setIsRenameDialogOpen(false);
          setItemToRename(null);
          setNewDocumentTitle("");
        },
      }
    );
  }, [itemToRename, newDocumentTitle, renameDocumentMutation]);

  const handleCloseDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
    setIsRenameDialogOpen(false);
    setItemToRename(null);
    setNewDocumentTitle("");
  }, []);

  const RenameForm = (
    <>
      <DialogHeader>
        <DialogTitle>Rename Document</DialogTitle>
      </DialogHeader>
      <Input
        value={newDocumentTitle}
        onChange={(e) => setNewDocumentTitle(e.target.value)}
        placeholder="Document Title"
      />
      <DialogFooter>
        <Button variant="outline" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirmRename}
          disabled={
            !newDocumentTitle.trim() || renameDocumentMutation.isPending
          }
        >
          {renameDocumentMutation.isPending ? "Renaming..." : "Rename"}
        </Button>
      </DialogFooter>
    </>
  );

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
                  onClick={() => handleShareClick(doc.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Copy shareable link"
                >
                  <Share2 className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="More options"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDownloadClick(doc.id)}
                    >
                      <CloudDownload className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleRenameClick(doc.id, doc.title)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(doc.id, doc.title)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Eraser className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDialog}
          variant="destructive"
          title="Delete Document"
          description={`Are you sure you want to delete ${itemToDelete?.title}? This action cannot be undone.`}
          cancelText="Cancel"
          confirmText="Delete"
        />

        {isDesktop ? (
          <Dialog open={isRenameDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent>{RenameForm}</DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isRenameDialogOpen} onOpenChange={handleCloseDialog}>
            <DrawerContent className="flex flex-col rounded-t-[10px] h-[18rem] mt-24 fixed bottom-0 left-0 right-0">
              <DrawerHeader className="text-left">
                <DrawerTitle>Rename Document</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 flex-1 overflow-auto">
                <Input
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                  placeholder="Document Title"
                />
              </div>
              <DrawerFooter className="pt-2">
                <Button
                  onClick={handleConfirmRename}
                  disabled={
                    !newDocumentTitle.trim() || renameDocumentMutation.isPending
                  }
                >
                  {renameDocumentMutation.isPending ? "Renaming..." : "Rename"}
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
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
