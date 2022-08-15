import { createRouter } from "./context";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createLineupSchema } from "./schemas/lineup.schema";
import { s3 } from "../../utils/FileUpload";
import { v4 as uuidv4 } from "uuid";

/**
 * Default selector for Lineup.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultLineupSelect = Prisma.validator<Prisma.LineupSelect>()({
  id: true,
  title: true,
  user: true,
  agent: true,
  map: true,
  image: true,
  text: true,
  votes: true,
  createdAt: true,
  updatedAt: true,
});

export const lineupRouter = createRouter()
  .query("by-author", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      return prisma?.lineup.findMany({
        where: {
          userId: input.id,
        },
      });
    },
  })
  // fetch all endpoint
  .query("get-all", {
    async resolve({}) {
      const lineups = await prisma?.lineup.findMany({
        orderBy: { votes: "asc" },
      });
      return lineups;
    },
  })
  // fetch byId
  .query("by-id", {
    input: z.object({
      id: z.string().cuid(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const lineup = await prisma?.lineup.findUnique({
        where: { id },
        select: defaultLineupSelect,
      });
      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No lineup with id ${id}`,
        });
      }
      return lineup;
    },
  });

export const proctedLineupRouter = createRouter()
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const lineup = await ctx.prisma.lineup.findUnique({
        where: { id: input.id },
      });

      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lineup does not exist",
        });
      }

      if (ctx.session?.user?.id !== lineup?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }
      await ctx.prisma.lineup.delete({
        where: { id: lineup?.id },
      });
      return lineup?.id;
    },
  })
  .mutation("edit", {
    input: z.object({
      id: z.string().cuid(),
      data: z.object({
        title: z.string().optional(),
        text: z.string().optional(),
      }),
    }),
    async resolve({ input, ctx }) {
      const { id, data } = input;
      const lineup = await ctx.prisma.lineup.update({
        where: { id },
        data,
        select: defaultLineupSelect,
      });
      return lineup;
    },
  })
  .mutation("create", {
    input: createLineupSchema,
    async resolve({ input, ctx }) {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You have to be logged in to create a lineup",
        });
      }
      const lineup = await ctx.prisma.lineup.create({
        data: {
          ...input,
          creator: ctx.session.user.name as string,
          userId: ctx.session.user.id,
        },
      });

      return lineup;
    },
  })
  .mutation("create-presigned-url", {
    async resolve({ ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You need to be logged in to perform this action",
        });
      }
      const rndKey = uuidv4();

      // create and recieve the URL and Fields for a presigned URL
      return new Promise((resolve, reject) => {
        s3.createPresignedPost(
          {
            Fields: {
              Key: rndKey,
            },
            Expires: 120, // time in seconds the user have to upload,
            Bucket: process.env.BUCKET_NAME,
            Conditions: [
              // TODO: support video + mutliple files, consider uploading to a folder
              ["starts-with", "$Content-Type", "image/"], // whitelist images for now
              ["content-length-range", 0, 1024 * 1024 * 18], // 18 mb limit for now
            ],
          },
          (err, signed) => {
            if (err) return reject(err);
            // returns url and fields if successful
            resolve(signed);
          }
        );
      });
    },
  });

/*
      // Works sort of I think
      const signedUrl = await s3.getSignedUrlPromise("putObject", params);
      await axios.put(signedUrl, {
        body: input.file,
        headers: {
          "Content-Type": input.fileType,
        },
      });

      const imageUrl = signedUrl.split("?")[0];
      console.log("imageUrl >>>>>>>>>>>>>>>", imageUrl);
      return imageUrl;
      */
