import Editor from "@/components/editor/editor";
import SaveButton from "@/components/save-button";
import { caller } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const documentId = "1";
  const document = await caller.document.getById({ id: documentId });

  return (
    <main className="max-w-3xl mx-auto p-4">
      <Editor
        documentId={documentId}
        initialTitle={document.title}
        initialContent={document.content}
      />
      <div className="flex justify-end mt-6">
        <SaveButton />
      </div>
    </main>
  );
}
