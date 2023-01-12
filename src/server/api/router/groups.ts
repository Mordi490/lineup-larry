import { z } from "zod";
import { prisma } from "../../db";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const createGroupInput = z.object({
  name: z.string(),
  userId: z.string(),
  lineupId: z.string(),
  isPublic: z.boolean().default(false),
});

export const updateGroupInput = z.object({
  id: z.string(),
  name: z.string(),
  lineupId: z.string(),
  isPublic: z.boolean(),
});

// that new new router
export const groupRouter = createTRPCRouter({
  // This was prev named "get-public-groups"
  publicGroupsFromUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const groups = await prisma.group.findMany({
        where: { AND: [{ userId: input.id }, { isPublic: true }] },
        select: {
          name: true,
          id: true,
          Lineup: {
            select: { id: true, title: true, image: true, previewImg: true },
          },
        },
      });
      return groups;
    }),
  getSpecificGroup: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const group = await prisma.group.findUniqueOrThrow({
        where: { id: input.id },
      });
      return group;
    }),
  createGroup: protectedProcedure
    .input(createGroupInput)
    .mutation(async ({ ctx, input }) => {
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
    }),
  getPrivateGroups: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.group.findMany({
      where: {
        AND: [{ userId: ctx.session?.user?.id }, { isPublic: false }],
      },
    });
  }),
  getAllGroups: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.group.findMany({
      where: { userId: ctx.session?.user?.id },
      select: {
        id: true,
        name: true,
        Lineup: { select: { id: true, title: true } },
      },
    });
  }),
  updateGroup: protectedProcedure
    .input(updateGroupInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.group.update({
        where: { id: input.id },
        data: {
          isPublic: input.isPublic,
          Lineup: { connect: { id: input.lineupId } },
          name: input.name,
        },
      });
    }),
  addToGroup: protectedProcedure
    .input(z.object({ groupId: z.string(), lineupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.group.update({
        where: { id: input.groupId },
        data: { Lineup: { connect: { id: input.lineupId } } },
      });
    }),
  removeFromGroup: protectedProcedure
    .input(z.object({ lineupId: z.string(), groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.group.update({
        data: { Lineup: { disconnect: { id: input.lineupId } } },
        where: { id: input.groupId },
      });
    }),
  deleteGroup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.group.delete({
        where: { id: input.id },
      });
    }),
});
