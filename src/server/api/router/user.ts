import { TRPCError } from "@trpc/server";
import { prisma } from "../../db";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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

// new router
export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma?.user.findUnique({
        where: {
          id: input.id,
        },
        select: defaultUserSelect,
      });

      return user;
    }),

  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

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
    }),
  getUserSentiment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await prisma.vote.findFirst({
        where: {
          AND: [{ lineupId: input.id }, { userId: ctx.session.user.id }],
        },
      });

      if (!res) {
        return "";
      }
      return res.sentiment;
    }),

  fullUserInfo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: privateUserSelect,
      });

      if (ctx.session.user.id !== user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      return user;
    }),
});
