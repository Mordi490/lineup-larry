import { z } from "zod";
import { createRouter } from "./context";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createCommentSchema } from "./schemas/comment.schema";

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

export const commentRouter = createRouter().query("get-lineup-comments", {
  input: z.object({
    id: z.string(),
  }),
  async resolve({ input }) {
    // comments
    const comments = await prisma?.comment.findMany({
      where: {
        lineupId: input.id,
      },
      select: defaultCommentSelect,
      // names and images associated with the
    });
    return comments;
  },
});

export const protectedCommentRouter = createRouter().mutation(
  "create-comment",
  {
    input: createCommentSchema,
    async resolve({ ctx, input }) {
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

      if (!user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "you have to be logged in",
        });
      }

      const comment = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          userId: user.id as string,
          lineupId: lineup.id as string,
        },
      });

      return comment;
    },
  }
);
