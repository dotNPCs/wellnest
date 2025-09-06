import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { startOfDay, endOfDay, format } from "date-fns";
import { UserMood, MealType } from "@prisma/client";

export const journalRouter = createTRPCRouter({
  // Get journals for a specific date range (week view)
  getJournalsByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const journals = await ctx.db.journalEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          checkin: true, // Include related daily checkin if exists
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by date for easier consumption
      const journalsByDate: Record<string, typeof journals> = {};

      journals.forEach((journal) => {
        const dateKey = format(journal.createdAt, "yyyy-MM-dd");

        journalsByDate[dateKey] ??= [];

        journalsByDate[dateKey].push(journal);
      });

      return journalsByDate;
    }),

  // Get journals for a specific date
  getJournalsByDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const start = startOfDay(input.date);
      const end = endOfDay(input.date);

      const journals = await ctx.db.journalEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          checkin: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return journals;
    }),

  // Create a journal entry
  createJournal: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string(),
        mood: z.nativeEnum(UserMood).optional(),
        tags: z.array(z.string()).optional(),
        checkinId: z.string().optional(), // Link to a daily checkin
        createdAt: z.date().optional(), // Allow custom timestamp
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const addFamiliarity = ctx.db.userPet.updateMany({
        where: { userId, isActive: true },
        data: { familiarity: { increment: 1 } },
      });

      const journal = await ctx.db.journalEntry.create({
        data: {
          userId,
          title: input.title,
          content: input.content,
          mood: input.mood,
          tags: input.tags ?? [],
          checkinId: input.checkinId,
          createdAt: input.createdAt ?? new Date(),
        },
        include: {
          checkin: true,
        },
      });

      return journal;
    }),

  // Get daily checkins for a date range
  getDailyCheckins: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const checkins = await ctx.db.dailyCheckin.findMany({
        where: {
          userId,
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: [{ date: "desc" }, { mealType: "asc" }],
      });

      // Group by date and meal type for easier consumption
      const checkinsByDate: Record<
        string,
        Record<string, (typeof checkins)[0]>
      > = {};

      checkins.forEach((checkin) => {
        const dateKey = format(checkin.date, "yyyy-MM-dd");
        checkinsByDate[dateKey] ??= {};
        checkinsByDate[dateKey][checkin.mealType.toLowerCase()] = checkin;
      });

      return checkinsByDate;
    }),

  // Create or update daily checkin
  upsertDailyCheckin: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        mealType: z.nativeEnum(MealType),
        rating: z.number().min(0).max(5),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const checkin = await ctx.db.dailyCheckin.upsert({
        where: {
          userId_date_mealType: {
            userId,
            date: startOfDay(input.date),
            mealType: input.mealType,
          },
        },
        update: {
          rating: input.rating,
          notes: input.notes,
        },
        create: {
          userId,
          date: startOfDay(input.date),
          mealType: input.mealType,
          rating: input.rating,
          notes: input.notes,
        },
      });

      return checkin;
    }),

  // Get mood states for calendar view
  getMoodStates: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the latest journal entry for each date that has a mood
      const moodEntries = await ctx.db.journalEntry.findMany({
        where: {
          userId,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
          mood: {
            not: null,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get the latest mood for each date
      const moodsByDate: Record<string, UserMood> = {};

      moodEntries.forEach((entry) => {
        const dateKey = format(entry.createdAt, "yyyy-MM-dd");
        if (!moodsByDate[dateKey] && entry.mood) {
          moodsByDate[dateKey] = entry.mood;
        }
      });

      return moodsByDate;
    }),
});
