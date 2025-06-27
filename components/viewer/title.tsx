"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface ViewerTitleProps {
  docId: string;
}

export default function ViewerTitle({ docId }: ViewerTitleProps) {
  const trpc = useTRPC();
  const { data: doc } = useQuery(
    trpc.document.getById.queryOptions({ id: docId })
  );

  if (!doc) {
    return null;
  }

  return (
    <div className="text-xl font-medium w-full bg-transparent">{doc.title}</div>
  );
}
