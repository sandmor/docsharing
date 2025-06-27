import { z } from "zod";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { prisma } from "@/lib/prisma";

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
    .input(z.object({ id: z.string(), title: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const updatedDoc = await prisma.document.update({
        where: { id: input.id, userId: ctx.auth.userId },
        data: { title: input.title, content: input.content },
      });
      if (!updatedDoc) {
        throw new Error(
          "Document not found or you do not have permission to update it"
        );
      }
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
