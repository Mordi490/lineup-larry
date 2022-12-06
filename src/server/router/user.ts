import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";
import { Prisma } from "@prisma/client";

/**
 * Default selector for Users.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
// NB! groups will be handled in separate calls, most likely
export const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  image: true,
  Role: true,
  joinedAt: true,
});

// default + email
export const privateUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  image: true,
  Role: true,
  joinedAt: true,
  email: true,
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
      select: defaultUserSelect,
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
  .query("get-user-sentiment-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const res = await prisma.vote.findFirst({
        where: {
          AND: [{ lineupId: input.id }, { userId: ctx.session.user.id }],
        },
      });

      if (!res) {
        return "";
      }
      return res.sentiment;
    },
  })
  .query("protected-user-info", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: privateUserSelect,
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
