import { z } from "zod";
import { createRouter } from "./context";
import { Prisma } from "@prisma/client";

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
