import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

/**
 * Default selector for Users.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */

// Might not be needed
const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: false,
  name: true,
  email: false,
  emailVerified: false,
  image: true,
  accounts: false,
  sessions: false,
  Role: true,
  Lineups: false,
});

export const userRouter = createRouter().query("get-user", {
  input: z.object({
    id: z.string(),
  }),
  async resolve({ input }) {
    const user = await prisma?.user.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User was not found",
      });
    }
    return user;
  },
});

export const privateUserRouter = createProtectedRouter()
  .mutation("delete-user", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User was not found",
        });
      }

      if (user?.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const id = user.id;
      await ctx.prisma.user.delete({
        where: { id: user.id },
      });
      return {
        id,
      };
    },
  })
  .query("protected-user-info", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User was not found",
        });
      }

      if (ctx.session.user.id !== user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorieze to perform this action",
        });
      }

      return user;
    },
  });
