import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../init";
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
  setDocument: publicProcedure
    .input(z.object({ id: z.string(), title: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      const updatedDoc = await prisma.document.update({
        where: { id: input.id },
        data: { title: input.title, content: input.content },
      });
      return updatedDoc;
    }),
});

export type DocumentRouter = typeof documentRouter;
