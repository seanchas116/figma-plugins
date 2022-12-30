import { router } from "../trpc";
import { figmaRouter } from "./figma";

export const appRouter = router({
  figma: figmaRouter,
});

export type AppRouter = typeof appRouter;
