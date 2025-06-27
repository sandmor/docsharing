import Editor from "@/components/editor/editor";
import TitleEditor from "@/components/editor/title-editor";
import DynamicHeader from "@/components/layout/dynamic-header";
import Sidebar from "@/components/layout/sidebar";
import { caller, getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DocumentEditorProps {
  documentId?: string;
  children?: React.ReactNode;
}

export default async function DocumentEditor({
  documentId,
  children,
}: DocumentEditorProps) {
  const document =
    documentId && (await caller.document.getById({ id: documentId }));

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.document.getAllDocumentsForUser.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 h-screen sticky top-0">
          <Sidebar currentDocumentId={documentId} />
        </div>

        <div className="flex flex-col flex-1">
          <DynamicHeader>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <Sidebar currentDocumentId={documentId} />
                </SheetContent>
              </Sheet>
            </div>

            {document && (
              <div className="max-w-md flex-1">
                <TitleEditor />
              </div>
            )}
          </DynamicHeader>
          <main className="flex flex-col flex-1 p-4 overflow-y-auto">
            {document && (
              <>
                <Editor
                  documentId={documentId}
                  initialTitle={document.title}
                  initialContent={document.content}
                />
              </>
            )}
            {children}
          </main>
        </div>
      </div>
    </HydrationBoundary>
  );
}
