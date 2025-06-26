import Editor from "@/components/editor/editor";
import Sidebar from "@/components/layout/sidebar";
import SaveButton from "@/components/save-button";
import { caller, getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const documentId = (await params).docId;
  const document = await caller.document.getById({ id: documentId });

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.document.getAllDocumentsForUser.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Sidebar />
      <main className="flex-1 max-w-3xl mx-auto p-4 overflow-y-auto">
        <Editor
          documentId={documentId}
          initialTitle={document.title}
          initialContent={document.content}
        />
        <div className="flex justify-end mt-6">
          <SaveButton />
        </div>
      </main>
    </HydrationBoundary>
  );
}
