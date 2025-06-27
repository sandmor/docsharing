import { NextRequest, NextResponse } from "next/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { caller } from "@/lib/trpc/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const doc = await caller.document.getById({ id: (await params).docId });

    const headers = new Headers();
    headers.append("Content-Type", "text/markdown");
    headers.append(
      "Content-Disposition",
      `attachment; filename="${doc.title}.md"`
    );

    return new NextResponse(doc.content, { headers });
  } catch (error: any) {
    const status = getHTTPStatusCodeFromError(error);
    return new NextResponse(error.message, { status });
  }
}
