import { Lineup, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ObjectIdentifierList } from "aws-sdk/clients/s3";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { MAX_FILE_SIZE } from "../../pages/create";
import { s3 } from "../../utils/FileUpload";
import { prisma } from "../db/client";
import { createRouter } from "./context";
import { createLineupSchema, editLineupSchema } from "./schemas/lineup.schema";

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
  previewImg: true,
  image: true,
  text: true,
  votes: true,
  isSetup: true,
  createdAt: true,
  updatedAt: true,
});

export const lineupRouter = createRouter()
  .query("by-author", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      return prisma.lineup.findMany({
        where: {
          userId: input.id,
        },
        orderBy: { updatedAt: "desc" },
      });
    },
  })
  .query("user-stats", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const numOfLineup = await prisma.lineup.aggregate({
        where: { userId: input.id },
        _count: { id: true },
      });
      const netVotes = await prisma.lineup.aggregate({
        where: { userId: input.id },
        _sum: { votes: true },
      });
      const joinedAt = await prisma.user.findFirst({
        where: { id: input.id },
        select: { joinedAt: true },
      });
      const stats = { numOfLineup, netVotes, joinedAt };
      return stats;
    },
  })
  .query("get-all-by-votes", {
    async resolve({}) {
      return await prisma.lineup.findMany({
        orderBy: { votes: "desc" },
      });
    },
  })
  // inf recent lineup for a user
  .query("inf-recent-lineups-user", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      userID: z.string(),
    }),
    async resolve({ input }) {
      const limit = input.limit ?? 21;
      const { cursor } = input;
      const items = await prisma.lineup.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          userId: input.userID,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        select: { title: true, id: true },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    },
  })
  // inf highest rated lineup for a user
  .query("inf-highest-rated-lineups-user", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      userID: z.string(),
    }),
    async resolve({ input }) {
      const limit = input.limit ?? 21;
      const { cursor } = input;
      const items = await prisma.lineup.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          userId: input.userID,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          votes: "desc",
        },
        select: { title: true, id: true },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    },
  })
  .query("infiniteLineups", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      filter: z.enum(["recent", "oldest", "most-likes"]).default("recent"),
    }),
    async resolve({ input }) {
      const limit = input.limit ?? 20;
      const { cursor } = input;
      const filter = input.filter;

      let items: Lineup[];

      switch (filter) {
        case "oldest":
          items = await prisma.lineup.findMany({
            take: limit + 1, // get an extra item at the end which we'll use as next cursor
            where: {
              // OPTIONAL FILTERS GOES HERE, EG. MAP X, AGENT Y
            },
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "asc",
            },
          });
          break;
        case "most-likes":
          items = await prisma.lineup.findMany({
            take: limit + 1, // get an extra item at the end which we'll use as next cursor
            where: {},
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              votes: "desc",
            },
          });
          break;
        case "recent":
          items = await prisma.lineup.findMany({
            take: limit + 1, // get an extra item at the end which we'll use as next cursor
            where: {},
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "desc",
            },
          });
          break;
        default:
          // defaults to recent
          items = await prisma.lineup.findMany({
            take: limit + 1, // get an extra item at the end which we'll use as next cursor
            where: {},
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "desc",
            },
          });
          break;
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    },
  })
  // fetch all endpoint
  .query("get-all", {
    async resolve({}) {
      const lineups = await prisma.lineup.findMany({
        orderBy: { votes: "asc" },
      });
      return lineups;
    },
  })
  // fetch byId
  .query("by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const lineup = await prisma.lineup.findUnique({
        where: {
          id: input.id,
        },
        select: defaultLineupSelect,
      });
      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No lineup with id ${input.id}`,
        });
      }
      return lineup;
    },
  });

export const protectedLineupRouter = createRouter()
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
      return input.id;
    },
  })
  .mutation("update-lineup", {
    input: z.object({
      id: z.string(),
      updatedData: editLineupSchema,
    }),
    async resolve({ input, ctx }) {
      const lineup = await ctx.prisma.lineup.update({
        where: { id: input.id },
        data: {
          title: input.updatedData.title,
          agent: input.updatedData.agent,
          map: input.updatedData.map,
          isSetup: input.updatedData.isSetup,
          previewImg: input.updatedData.previewImg,
          image: input.updatedData.image,
          text: input.updatedData.text,
        },
      });
      return lineup;
    },
  })
  .mutation("cast-vote", {
    input: z.object({
      id: z.string(), // lineupID
      sentiment: z.string(), //
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You have to be signed in to perform this action",
        });
      }
      // find the lineup
      const lineup = await prisma.lineup.findFirstOrThrow({
        where: { id: input.id },
      });

      const sent = input.sentiment == "like" ? 1 : -1;

      // see if a vote exists already exists
      const vote = await prisma.vote.findFirst({
        where: {
          AND: [{ lineupId: lineup.id }, { userId: ctx.session?.user?.id }],
        },
      });

      // if the user's sentiment is the same as current: interpret as "undo"
      if (vote?.sentiment == input.sentiment) {
        // adjust votes
        await prisma.lineup.update({
          where: { id: lineup.id },
          data: { votes: { decrement: sent } },
        });
        // delete the vote record
        await prisma.vote.delete({
          where: { id: vote.id },
        });
        return "Vote undone";
      }

      // no vote exists: create one
      if (!vote) {
        const vote = await prisma.vote.create({
          data: {
            sentiment: input.sentiment,
            lineupId: lineup.id,
            userId: ctx.session.user.id,
          },
        });

        // NB! fails when "neutral" state gets added
        await prisma.lineup.update({
          where: { id: input.id },
          data: { votes: { increment: sent } },
        });

        return `${vote.sentiment} registered`;
      }
      // Check if new sentiment and old sentiment are the same
      if (input.sentiment == vote.sentiment) {
        return input.sentiment == "like"
          ? `You've already liked this lineup`
          : `You've already disliked this lineup`;
      }

      // update Vote entity with new value
      await prisma.vote.update({
        where: { id: vote.id },
        data: { sentiment: input.sentiment },
      });

      // update Votes for lineup
      await prisma.lineup.update({
        where: { id: input.id },
        data: { votes: { increment: sent } },
      });
      return `${vote.sentiment} registered`;
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
          title: input.title,
          text: input.text,
          image: input.image,
          agent: input.agent,
          map: input.map,
          isSetup: input.isSetup,
          userId: input.userId,
          creator: ctx.session.user.name as string,
        },
      });

      return lineup;
    },
  })
  .mutation("create-presigned-url", {
    input: z.object({
      fileType: z.string(),
    }),
    // TODO: pass a flag to determine if its a image file or video file
    async resolve({ input, ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You need to be logged in to perform this action",
        });
      }
      const rndKey = uuidv4();

      return s3.createPresignedPost({
        Fields: {
          // if the file is a video prefix it with "video", eg. "video-<UUID>"
          Key: input.fileType.includes("video") ? `video-${rndKey}` : rndKey,
        },
        Expires: 90, // time in seconds the user have to upload,
        Bucket: process.env.BUCKET_NAME,
        Conditions: [
          // TODO: support video + multiple files, consider uploading to a folder
          ["starts-with", "$Content-Type", input.fileType], // whitelist images for now
          ["content-length-range", 0, MAX_FILE_SIZE],
        ],
      });
    },
  })
  .mutation("delete-s3-object", {
    input: z.object({
      id: z.string(), // The lineup id with
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You need to be logged in to perform this action",
        });
      }
      // fetch current lineup
      const lineup = await ctx.prisma.lineup.findUnique({
        where: { id: input.id },
      });

      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No lineup with id: ${input.id}`,
        });
      }
      // bulk del all the img associated with the lineup
      const imgUrls = lineup.image.split(",");
      const list: ObjectIdentifierList = [];
      for (let img of imgUrls) {
        list.push({ Key: img });
      }

      return new Promise((resolve, reject) => {
        s3.deleteObjects(
          {
            Bucket: process.env.BUCKET_NAME as string,
            Delete: { Objects: list },
          },
          (err, success) => {
            if (err) {
              reject(err);
              throw new TRPCError({
                // TODO: Figure out a less cryptic err msg
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to communicate with server",
              });
            }
            resolve(success);
          }
        );
      });
    },
  });
