import { z } from "zod";

export const commentForm = z.object({
  content: z
    .string()
    .min(3, { message: "A comment must be 3 characters or longer" })
    .max(100, { message: "A comment cannot exceed 100 characters" }),
});

export const createCommentSchema = z.object({
  content: z.string(),
  lineupId: z.string(),
});
