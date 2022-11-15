import { createRouter } from "./context";
import { z } from "zod";
import { prisma } from "../db/client";
import { TRPCError } from "@trpc/server";

export const createGroupInput = z.object({
  name: z.string(),
  userId: z.string(),
  lineupId: z.string(),
  isPublic: z.boolean(),
});

export const updateGroupInput = z.object({
  id: z.string(),
  name: z.string(),
  lineupId: z.string(),
  isPublic: z.boolean(),
});

// public endpoints: get public groups given a userId
export const groupRouter = createRouter()
  .query("get-public-groups", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const groups = await prisma.group.findMany({
        where: { userId: input.id },
      });
      return groups;
    },
  })
  // Could be used for copying a pre-existing group and append your
  .query("get-specific-group", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { id: input.id },
      });
      return group;
    },
  });

// protected endpoints: create group, edit/update, delete
export const protectedGroupRouter = createRouter()
  .mutation("create-group", {
    input: createGroupInput,
    async resolve({ input, ctx }) {
      const lineup = await ctx.prisma.lineup.findUnique({
        where: { id: input.lineupId },
      });

      if (!lineup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Failed to find lineup with id: ${input.lineupId}`,
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user found with id: ${input.userId}`,
        });
      }

      const group = await ctx.prisma.group.create({
        data: {
          name: input.name,
          isPublic: input.isPublic,
          userId: input.userId,
          // TODO: IFF working, refactor old cases
          Lineup: { connect: { id: input.lineupId } },
        },
      });

      return group;
    },
  })
  .query("get-private-groups", {
    async resolve({ ctx }) {
      return await ctx.prisma.group.findMany({
        where: {
          AND: [{ userId: ctx.session?.user?.id }, { isPublic: false }],
        },
      });
    },
  })
  .query("get-all-groups", {
    async resolve({ ctx }) {
      return await ctx.prisma.group.findMany({
        where: { userId: ctx.session?.user?.id },
        select: { id: true, name: true, Lineup: true },
      });
    },
  })
  // TODO: double check that updates changes work as intended
  // used for large changes
  .mutation("update-group", {
    input: updateGroupInput,
    async resolve({ input, ctx }) {
      return await ctx.prisma.group.update({
        where: { id: input.id },
        data: {
          isPublic: input.isPublic,
          Lineup: { connect: { id: input.lineupId } },
          name: input.name,
        },
      });
    },
  })
  // minute changes
  .mutation("add-to-group", {
    input: z.object({
      groupId: z.string(),
      lineupId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.group.update({
        where: { id: input.groupId },
        data: { Lineup: { connect: { id: input.lineupId } } },
      });
    },
  });
