import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { startOfDay, endOfDay } from "date-fns";
import { UserMood } from "@prisma/client";

export const journalRouter = createTRPCRouter({
  // 1. Get today's journals
  getJournal: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    const journals = await ctx.db.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return journals;
  }),

  // 2. Create a journal entry for today
  createJournal: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string(),
        mood: z.nativeEnum(UserMood).optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const journal = await ctx.db.journalEntry.create({
        data: {
          userId,
          title: input.title,
          content: input.content,
          mood: input.mood,
          tags: input.tags ?? [],
        },
      });

      return journal;
    }),
});
