import DynamicHeader from "@/components/layout/dynamic-header";
import Sidebar from "@/components/layout/sidebar";
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { FileText, PlusSquare } from "lucide-react";

export default async function DocumentsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.document.getAllDocumentsForUser.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen grid grid-rows-[auto_1fr]">
        <DynamicHeader />
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 max-w-3xl mx-auto p-4 overflow-y-auto">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter mb-4">
                  Your Document Hub
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
                  Select a document from the sidebar to begin editing, or create
                  a new one to start fresh.
                </p>
                <div className="flex justify-center items-center gap-8 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-blue-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Select a Document
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs">
                      Click on a document title in the sidebar to open it in the
                      editor.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <PlusSquare className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Create a New One
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs">
                      Use the &quot;New Document&quot; button to start writing
                      from scratch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </HydrationBoundary>
  );
}
