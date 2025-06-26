import Viewer from "@/components/viewer";
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
    <main className="max-w-[1200px] mx-auto p-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Viewer docId={documentId} />
      </HydrationBoundary>
    </main>
  );
}
