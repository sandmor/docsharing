import DynamicHeader from "@/components/layout/dynamic-header";
import ViewerTitle from "@/components/viewer/title";
import Viewer from "@/components/viewer/viewer";
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const queryClient = getQueryClient();

  const documentId = (await params).docId;

  await queryClient.prefetchQuery(
    trpc.document.getById.queryOptions({ id: documentId })
  );

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DynamicHeader>
          <ViewerTitle docId={documentId} />
        </DynamicHeader>
        <main className="max-w-[1200px] mx-auto p-4">
          <Viewer docId={documentId} />
        </main>
      </HydrationBoundary>
    </div>
  );
}
