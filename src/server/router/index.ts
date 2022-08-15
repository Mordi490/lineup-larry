// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { lineupRouter, proctedLineupRouter } from "./lineups";
import { userRouter, privateUserRouter } from "./user";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("question.", protectedExampleRouter)
  .merge("lineup.", lineupRouter)
  .merge("privateLineup.", proctedLineupRouter)
  .merge("user.", userRouter)
  .merge("privateUserRouter.", privateUserRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
