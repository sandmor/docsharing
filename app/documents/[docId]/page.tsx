import DocumentEditor from "@/components/layout/document-editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const documentId = (await params).docId;

  return <DocumentEditor documentId={documentId} />;
}
