import { PrismaClient } from "@prisma/client";

import { env } from "../env/server.mjs";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // prev was:
    // log: ["query"],
    log:
    env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
