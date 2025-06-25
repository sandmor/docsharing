import { createTRPCRouter } from "../init";
import { documentRouter } from "./document";

export const appRouter = createTRPCRouter({
  document: documentRouter,
});

export type AppRouter = typeof appRouter;
