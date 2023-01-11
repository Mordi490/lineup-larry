import { commentRouter } from "./router/comments";
import { groupRouter } from "./router/groups";
import { lineupRouter } from "./router/lineups";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  comment: commentRouter,
  lineup: lineupRouter,
  user: userRouter,
  group: groupRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
