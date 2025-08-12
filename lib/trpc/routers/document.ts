import { z } from "zod";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { getFileKeysFromMarkdown } from "@/lib/utils";
import { Prisma } from "@/lib/generated/prisma";

const MAX_DOCUMENT_BYTES = (() => {
  const raw = process.env.DOCUMENT_MAX_BYTES || "200000"; // ~200 KB default
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 200000;
})();

function ensureWithinSize(content: string) {
  // UTF-8 byte length
  const bytes = new TextEncoder().encode(content).length;
  if (bytes > MAX_DOCUMENT_BYTES) {
    throw new Error(
      `Document too large (${bytes.toLocaleString()} bytes). Max allowed is ${MAX_DOCUMENT_BYTES.toLocaleString()} bytes.`
    );
  }
}

async function syncDocumentFiles(
  tx: Prisma.TransactionClient,
  userId: string,
  documentId: string,
  content: string
) {
  const newFileKeys = getFileKeysFromMarkdown(content);

  // Soft-delete files that are no longer referenced in the document
  const oldFileRecords = await tx.file.findMany({
    where: { userId, documentId },
    select: { fileKey: true },
  });
  const oldFileKeys = oldFileRecords.map((f: { fileKey: string }) => f.fileKey);
  const removedKeys = oldFileKeys.filter(
    (k: string) => !newFileKeys.includes(k)
  );

  if (removedKeys.length > 0) {
    await tx.file.updateMany({
      where: { userId, documentId, fileKey: { in: removedKeys } },
      data: { deletedAt: new Date() },
    });
  }

  // Associate new files and/or restore files that are referenced in the content
  if (newFileKeys.length > 0) {
    // This operation claims any referenced files for the current document
    await tx.file.updateMany({
      where: { userId, fileKey: { in: newFileKeys } },
      data: { documentId, deletedAt: null },
    });
  }
}

export const documentRouter = createTRPCRouter({
  importMarkdown: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Markdown content is required")
          .max(MAX_DOCUMENT_BYTES * 2, "Content exceeds hard safety cap."),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.userId;
      const { content } = input;

      ensureWithinSize(content);

      // Extract title candidates
      let derivedTitle: string | undefined = input.title?.trim();
      if (!derivedTitle) {
        // YAML front matter
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontMatterMatch) {
          const titleLine = frontMatterMatch[1]
            .split(/\r?\n/)
            .find((l) => l.toLowerCase().startsWith("title:"));
          if (titleLine) {
            const fmTitle = titleLine.split(":")[1]?.trim().replace(/^['"]|['"]$/g, "");
            if (fmTitle) derivedTitle = fmTitle;
          }
        }
      }
      if (!derivedTitle) {
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
          derivedTitle = h1Match[1].trim();
        }
      }
      if (!derivedTitle) {
        derivedTitle = "Imported Document";
      }

      const newDoc = await prisma.$transaction(async (tx) => {
        const doc = await tx.document.create({
          data: { title: derivedTitle!, content, userId },
        });

        await syncDocumentFiles(tx, userId, doc.id, content);

        return doc;
      });

      return newDoc;
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const doc = await prisma.document.findUnique({
        where: { id: input.id },
      });
      if (!doc) {
        throw new Error("Document not found");
      }
      return doc;
    }),
  getAllDocumentsForUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return documents;
  }),
  newDocument: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const newDoc = await prisma.document.create({
      data: {
        title: "New Document",
        content: "",
        userId,
      },
    });
    return newDoc;
  }),
  setDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, title, content } = input;
      const userId = ctx.auth.userId;

      const updatedDoc = await prisma.$transaction(async (tx) => {
        if (content) {
          ensureWithinSize(content); // enforce on updates as well
          await syncDocumentFiles(tx, userId, id, content);
        }

        const docToUpdate = await tx.document.findUnique({
          where: { id, userId },
        });

        if (!docToUpdate) {
          throw new Error(
            "Document not found or you do not have permission to update it"
          );
        }

        const updated = await tx.document.update({
          where: { id, userId },
          data: {
            ...(title && { title }),
            ...(content && { content }),
          },
        });

        return updated;
      });

      return updatedDoc;
    }),
  renameDocument: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const updatedDoc = await prisma.document.update({
        where: { id: input.id, userId: ctx.auth.userId },
        data: { title: input.title },
      });
      if (!updatedDoc) {
        throw new Error(
          "Document not found or you do not have permission to rename it"
        );
      }
      return updatedDoc;
    }),
  deleteDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.userId;
      const deletedDoc = await prisma.document.deleteMany({
        where: { id: input.id, userId },
      });
      if (deletedDoc.count === 0) {
        throw new Error(
          "Document not found or you do not have permission to delete it"
        );
      }
      return { success: true };
    }),
});

export type DocumentRouter = typeof documentRouter;
