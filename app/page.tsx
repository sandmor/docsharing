import Editor from "@/components/editor";
import SaveButton from "@/components/save-button";
import { caller } from "@/lib/trpc/server";

export default async function Home() {
  const documentId = "1";
  const document = await caller.document.getById({ id: documentId });

  return (
    <main className="max-w-3xl mx-auto p-4">
      <Editor documentId={documentId} initialContent={document.content} />
      <div className="flex justify-end mt-6">
        <SaveButton />
      </div>
    </main>
  );
}
