import { z } from "zod";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { getFileKeysFromMarkdown } from "@/lib/utils";

export const documentRouter = createTRPCRouter({
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
          const newFileKeys = getFileKeysFromMarkdown(content);
          const oldFileRecords = await tx.file.findMany({
            where: {
              userId,
              documentId: id,
            },
            select: { fileKey: true, deletedAt: true },
          });

          let restoreKeys = []; // For files that were deleted but now are present in the content
          let removedKeys = [];

          for (const file of oldFileRecords) {
            const isPresent = newFileKeys.includes(file.fileKey);
            if (isPresent) {
              if (file.deletedAt) {
                restoreKeys.push(file.fileKey);
              }
            } else {
              removedKeys.push(file.fileKey);
            }
          }

          // It is not responsability of this function to handle unregistered files now referenced in the content

          if (restoreKeys.length > 0) {
            // Restore files that were deleted
            await tx.file.updateMany({
              where: { fileKey: { in: restoreKeys } },
              data: { deletedAt: null },
            });
          }

          if (removedKeys.length > 0) {
            // Schedule files for deletion
            await tx.file.updateMany({
              where: { fileKey: { in: removedKeys } },
              data: { deletedAt: new Date() },
            });
          }
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
