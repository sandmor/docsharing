import { Textarea } from "@/components/ui/textarea";
import { caller } from "@/lib/trpc/server";

export default async function Home() {
  const document = await caller.document.getById({ id: "1" });

  return <Textarea defaultValue={document.content} />;
}
