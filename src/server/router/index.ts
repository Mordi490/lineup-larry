// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { protectedExampleRouter } from "./protected-example-router";
import { lineupRouter, proctedLineupRouter } from "./lineups";
import { userRouter, privateUserRouter } from "./user";
import { commentRouter, protectedCommentRouter } from "./comments";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("question.", protectedExampleRouter)
  .merge("lineup.", lineupRouter)
  .merge("privateLineup.", proctedLineupRouter)
  .merge("user.", userRouter)
  .merge("privateUserRouter.", privateUserRouter)
  .merge("commentRouter.", commentRouter)
  .merge("protectedCommentRouter.", protectedCommentRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
