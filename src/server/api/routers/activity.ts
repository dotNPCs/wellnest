import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ActivityType, MealType } from "@prisma/client";
import { addDays, isSameDay, differenceInCalendarDays } from "date-fns";
import { HAPPINESS_CONFIG, getNextMeal } from "@/lib/points";
import { get } from "http";

export const activityRouter = createTRPCRouter({
  createActivity: protectedProcedure
    .input(
      z.object({
        details: z.string().optional(),
        activity: z.nativeEnum(ActivityType),
        durationMinutes: z.number().optional(), // Only for exercise/meditation
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const durationMs = (input.durationMinutes ?? 0) * 60 * 1000;
      const userActivity = await ctx.db.userActivity.create({
        data: {
          userId,
          duration: input.durationMinutes ?? 0,
          activity: input.activity,
          notes: input.notes,
          createdAt: new Date(Date.now() - durationMs),
        },
      });
    }),

  getActivities: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        activity: z.nativeEnum(ActivityType).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const activities = await ctx.db.userActivity.findMany({
        where: {
          userId,
          activity: input.activity,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return activities;
    }),
});
