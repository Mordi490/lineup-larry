import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db";
import { TRPCError } from "@trpc/server";
import { createCommentSchema } from "./schemas/comment.schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  content: true,
  date: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
});

export const commentRouter = createTRPCRouter({
  getLineupComments: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const comments = await prisma.comment.findMany({
        where: {
          lineupId: input.id,
        },
        select: defaultCommentSelect,
        // names and images associated with the
      });
      return comments;
    }),
  createComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      // find the lineup first
      const lineup = await ctx.prisma.lineup.findUnique({
        where: { id: input.lineupId },
      });

      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No lineup with id: ${input.lineupId}`,
        });
      }

      const user = ctx.session?.user;
      const comment = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          userId: user.id as string,
          lineupId: lineup.id as string,
        },
      });

      return comment;
    }),
});
