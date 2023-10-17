import { Lineup, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { agentList, mapList } from "../../../../utils/enums";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../db";
import { myS3Client } from "../aws/s3";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { createLineupSchema, editLineupSchema } from "./schemas/lineup.schema";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { UploadPartCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  YTLink: true,
  createdAt: true,
  updatedAt: true,
});

const filterOptions = ["recent", "most-likes", "oldest"] as const;
type FilterTypes = (typeof filterOptions)[number];
const plsWork: [FilterTypes, ...FilterTypes[]] = [
  filterOptions[0],
  ...filterOptions.slice(1).map((val) => val),
];

export const lineupRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
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
    }),
  byAuthor: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
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
    }),
  userStats: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
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
    }),
  // This was prev: inf-recent-lineups-user
  recentLineupsFromUser: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
        userID: z.string(),
      })
    )
    .query(async ({ input }) => {
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
    }),
  highestRatedLineupsFromUser: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
        userID: z.string(),
      })
    )
    .query(async ({ input }) => {
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
    }),
  infiniteLineups: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
        filter: z.enum(plsWork),
        agent: z.enum(agentList).nullish(),
        map: z.enum(mapList).nullish(),
        // TODO after agents & maps
        //setup: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 20;
      const { cursor } = input;
      const filter = input.filter;

      let items: Lineup[];

      // war crimes will be committed
      // FIXME: surely there is a cleaner wy of doing this
      switch (filter) {
        case "oldest":
          // for every scenario check if map and agent are "included"
          // just agent
          if (input.agent != null && input.map == null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { agent: input.agent },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                createdAt: "asc",
              },
            });
            break;
          }
          // just map
          if (input.agent == null && input.map != null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { map: input.map },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                createdAt: "asc",
              },
            });
            break;
          }
          // both agent & map hav been selected
          if (input.agent != null && input.map != null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { AND: [{ agent: input.agent }, { map: input.map }] },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                createdAt: "asc",
              },
            });
            break;
          }

          // they are NOT included, eg. the default/initial state
          items = await prisma.lineup.findMany({
            take: limit + 1, // get an extra item at the end which we'll use as next cursor
            where: {},
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "asc",
            },
          });
          break;
        case "most-likes":
          if (input.agent != null && input.map == null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { agent: input.agent },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                votes: "desc",
              },
            });
            break;
          }
          if (input.agent == null && input.map != null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { map: input.map },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                votes: "desc",
              },
            });
            break;
          }
          if (input.agent != null && input.map != null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { AND: [{ agent: input.agent }, { map: input.map }] },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                votes: "desc",
              },
            });
            break;
          }
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
          if (input.agent != null && input.map == null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { agent: input.agent },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                createdAt: "desc",
              },
            });
            break;
          }
          if (input.agent == null && input.map != null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { map: input.map },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                createdAt: "desc",
              },
            });
            break;
          }
          if (input.agent != null && input.map != null) {
            items = await prisma.lineup.findMany({
              take: limit + 1, // get an extra item at the end which we'll use as next cursor
              where: { AND: [{ agent: input.agent }, { map: input.map }] },
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: {
                createdAt: "desc",
              },
            });
            break;
          }
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
    }),
  // doesn't get used but
  getAllLineups: publicProcedure.query(async () => {
    return await prisma.lineup.findMany({
      orderBy: { votes: "asc" },
    });
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
    }),
  updateLineup: protectedProcedure
    .input(z.object({ id: z.string(), updatedData: editLineupSchema }))
    .mutation(async ({ ctx, input }) => {
      // remove everything above this line as soon as we are sure this is not the culprit
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
    }),
  getMultipartUploadPresignedUrl: protectedProcedure
    .input(z.object({ key: z.string(), filePartTotal: z.number() }))
    .mutation(async ({ ctx, input }) => {}),
  castVote: protectedProcedure
    .input(z.object({ id: z.string(), sentiment: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
    }),
  create: protectedProcedure
    .input(createLineupSchema)
    .mutation(async ({ ctx, input }) => {
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
          previewImg: input.previewImg,
          isSetup: input.isSetup,
          YTLink: input.YTLink,
          userId: input.userId,
          creator: ctx.session.user.name as string,
        },
      });

      return lineup;
    }),
  createPresignedUrl: protectedProcedure
    .input(z.object({ fileType: z.string(), key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await createPresignedPost(myS3Client, {
        Bucket: env.AWS_BUCKET_NAME,
        Key: input.key,
        Expires: 3600, // the user has 1 hour to use the presigned URL
        Conditions: [["starts-with", "$Content-Type", input.fileType]],
      });
    }),
  // heavily based on: https://github.dev/nramkissoon/t3-s3
  // TODO: test thatit works
  createMultipartUpload: protectedProcedure
    .input(z.object({ key: z.string(), totalFileParts: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { key, totalFileParts } = input;

      const uploadId = (
        await myS3Client.createMultipartUpload({
          Bucket: env.AWS_BUCKET_NAME,
          Key: key,
        })
      ).UploadId;

      if (!uploadId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create a multipart upload url",
        });
      }

      const presignedUploadUrls: Promise<{
        url: string;
        partNumber: number;
      }>[] = [];

      for (let i = 1; i <= totalFileParts; i++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: i,
        });

        const url = getSignedUrl(myS3Client, uploadPartCommand).then((url) => ({
          url,
          partNumber: i,
        }));

        presignedUploadUrls.push(url);
      }

      return {
        uploadId,
        urls: await Promise.all(presignedUploadUrls),
      };
    }),
  // This one might actually be useless since S3 seems to complete itself once all parts have been received...
  completeMultipartUpload: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        uploadId: z.string(),
        parts: z.array(z.object({ ETag: z.string(), PartNumber: z.number() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, uploadId, parts } = input;

      const completeMultipartUpload = await myS3Client.completeMultipartUpload({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });

      return completeMultipartUpload;
    }),
  deleteS3Object: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // alternative approach: set input to be an array of S3 keys and just blindly send them
      const lineup = await ctx.prisma.lineup.findUnique({
        where: { id: input.id },
      });

      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No lineup with id: ${input.id}`,
        });
      }

      if (lineup.image !== null) {
        // list has have following shape: { Key: <actual_key> }
        const list = lineup.image
          ?.split(",")
          .map((imgUrl) => ({ Key: imgUrl }));

        const params = {
          Bucket: env.AWS_BUCKET_NAME,
          Delete: {
            Objects: list,
          },
        };

        myS3Client.send(new DeleteObjectsCommand(params))
          .then((data) => {
            //console.log("successfully deleted data!", data);
          })
          .catch((err) => {
            //console.error("Failed to delete data", err);
          });
      }
    }),
});
