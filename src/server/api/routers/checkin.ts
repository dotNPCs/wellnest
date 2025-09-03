import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { MealType } from "@prisma/client";

export const checkinRouter = createTRPCRouter({
  // Get check-in status for a specific date
  getCheckinStatus: protectedProcedure
    .input(
      z.object({
        date: z
          .date()
          .optional()
          .default(() => new Date()), // Defaults to today
      }),
    )
    .query(async ({ ctx, input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all check-ins for the user on the specified date
      const checkins = await ctx.db.dailyCheckin.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          mealType: true,
          rating: true,
          notes: true,
          createdAt: true,
        },
      });

      // Create a map of existing check-ins
      const checkinMap = new Map(
        checkins.map((checkin) => [checkin.mealType, checkin]),
      );

      // Check status for each meal type
      const status = {
        breakfast: {
          completed: checkinMap.has(MealType.BREAKFAST),
          data: checkinMap.get(MealType.BREAKFAST) || null,
        },
        lunch: {
          completed: checkinMap.has(MealType.LUNCH),
          data: checkinMap.get(MealType.LUNCH) || null,
        },
        dinner: {
          completed: checkinMap.has(MealType.DINNER),
          data: checkinMap.get(MealType.DINNER) || null,
        },
      };

      // Calculate completion stats
      const completedCount = Object.values(status).filter(
        (meal) => meal.completed,
      ).length;

      return {
        date: input.date,
        status,
        completedCount,
        totalMeals: 3,
        isFullyCompleted: completedCount === 3,
        completionPercentage: Math.round((completedCount / 3) * 100),
      };
    }),

  // Get check-in status for multiple dates (useful for streak calculation)
  getCheckinStatusRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const checkins = await ctx.db.dailyCheckin.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        select: {
          mealType: true,
          date: true,
          rating: true,
          notes: true,
          createdAt: true,
        },
        orderBy: {
          date: "asc",
        },
      });

      // Group check-ins by date
      const checkinsByDate = checkins.reduce(
        (acc, checkin) => {
          const dateKey =
            checkin.date instanceof Date
              ? checkin.date.toISOString().split("T")[0]
              : undefined;
          if (dateKey) {
            if (!acc[dateKey]) {
              acc[dateKey] = [];
            }
            acc[dateKey].push(checkin);
          }
          return acc;
        },
        {} as Record<string, typeof checkins>,
      );

      // Generate status for each date in the range
      const dateRange = [];
      const currentDate = new Date(input.startDate);

      while (currentDate <= input.endDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        let dayCheckins: typeof checkins = [];
        if (typeof dateKey === "string" && dateKey in checkinsByDate) {
          dayCheckins = checkinsByDate[dateKey] ?? [];
        }

        const checkinMap = new Map(
          dayCheckins.map((checkin) => [checkin.mealType, checkin]),
        );

        const status = {
          breakfast: {
            completed: checkinMap.has(MealType.BREAKFAST),
            data: checkinMap.get(MealType.BREAKFAST) || null,
          },
          lunch: {
            completed: checkinMap.has(MealType.LUNCH),
            data: checkinMap.get(MealType.LUNCH) || null,
          },
          dinner: {
            completed: checkinMap.has(MealType.DINNER),
            data: checkinMap.get(MealType.DINNER) || null,
          },
        };

        const completedCount = Object.values(status).filter(
          (meal) => meal.completed,
        ).length;

        dateRange.push({
          date: new Date(currentDate),
          status,
          completedCount,
          totalMeals: 3,
          isFullyCompleted: completedCount === 3,
          completionPercentage: Math.round((completedCount / 3) * 100),
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        dateRange,
        totalDays: dateRange.length,
        fullyCompletedDays: dateRange.filter((day) => day.isFullyCompleted)
          .length,
        overallCompletionPercentage: Math.round(
          (dateRange.reduce((sum, day) => sum + day.completedCount, 0) /
            (dateRange.length * 3)) *
            100,
        ),
      };
    }),

  // Quick check for today's completion status
  getTodayStatus: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const checkins = await ctx.db.dailyCheckin.findMany({
      where: {
        userId: ctx.session.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        mealType: true,
      },
    });

    const completedMeals = new Set(checkins.map((c) => c.mealType));

    return {
      breakfast: completedMeals.has(MealType.BREAKFAST),
      lunch: completedMeals.has(MealType.LUNCH),
      dinner: completedMeals.has(MealType.DINNER),
      completedCount: completedMeals.size,
      isFullyCompleted: completedMeals.size === 3,
    };
  }),
});
