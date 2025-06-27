import Editor from "@/components/editor/editor";
import TitleEditor from "@/components/editor/title-editor";
import DynamicHeader from "@/components/layout/dynamic-header";
import Sidebar from "@/components/layout/sidebar";
import SaveButton from "@/components/save-button";
import { caller, getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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
      <div className="flex h-screen overflow-y-auto">
        <Sidebar currentDocumentId={documentId} />
        <div className="flex-1">
          <DynamicHeader>
            {document && (
              <div className="max-w-md">
                <TitleEditor />
              </div>
            )}
          </DynamicHeader>
          <main className="flex-1 p-4">
            {document && (
              <>
                <Editor
                  documentId={documentId}
                  initialTitle={document.title}
                  initialContent={document.content}
                />

                <div className="flex justify-end mt-6">
                  <SaveButton />
                </div>
              </>
            )}
            {children}
          </main>
        </div>
      </div>
    </HydrationBoundary>
  );
}
