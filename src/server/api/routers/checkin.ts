import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { MealType } from "@prisma/client";
import { addDays, isSameDay, differenceInCalendarDays } from "date-fns";
import { HAPPINESS_CONFIG, getNextMeal } from "@/lib/points";

export const checkinRouter = createTRPCRouter({
  createCheckInToApp: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const lastCheckin = await ctx.db.userCheckIn.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const today = new Date();

    if (lastCheckin && isSameDay(lastCheckin.createdAt, today)) {
      // Already checked in today
      return lastCheckin;
    }

    let newStreak = 1;

    if (lastCheckin) {
      const daysDiff = differenceInCalendarDays(today, lastCheckin.createdAt);

      if (daysDiff === 1) {
        // Consecutive day → increment streak
        const userStreak = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { streakCount: true },
        });

        if (!userStreak) {
          throw new Error("User not found");
        }
        newStreak = userStreak.streakCount + 1;

        if (newStreak > 1) {
          const updateUserPetFamiliarity = ctx.db.userPet.updateMany({
            where: { userId, isActive: true },
            data: {
              familiarity: {
                increment:
                  HAPPINESS_CONFIG.actions.checkin + Math.min(newStreak, 3), // Cap bonus from streak at 10
              },
            },
          });
        }
      } else {
        if (daysDiff > 1) {
          const pet = await ctx.db.userPet.findFirst({
            where: { userId, isActive: true },
            select: { id: true, familiarity: true },
          });
          if (!pet) {
            throw new Error("No active pet found");
          }
          const decayAmount = daysDiff * HAPPINESS_CONFIG.decayPerDay;
          const updateUserPetFamiliarity = ctx.db.userPet.updateMany({
            where: { userId, isActive: true },
            data: {
              familiarity: {
                decrement: Math.max(pet.familiarity - decayAmount, 10),
              },
            },
          });
        }
      }
    }
    // Update user's streakCount
    await ctx.db.user.update({
      where: { id: userId },
      data: { streakCount: newStreak },
    });

    // Add new checkin row
    const newCheckIn = await ctx.db.userCheckIn.create({
      data: {
        userId,
        createdAt: today,
      },
    });

    return newCheckIn;
  }),

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
          data: checkinMap.get(MealType.BREAKFAST) ?? null,
        },
        lunch: {
          completed: checkinMap.has(MealType.LUNCH),
          data: checkinMap.get(MealType.LUNCH) ?? null,
        },
        dinner: {
          completed: checkinMap.has(MealType.DINNER),
          data: checkinMap.get(MealType.DINNER) ?? null,
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
            acc[dateKey] ??= [];

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
            data: checkinMap.get(MealType.BREAKFAST) ?? null,
          },
          lunch: {
            completed: checkinMap.has(MealType.LUNCH),
            data: checkinMap.get(MealType.LUNCH) ?? null,
          },
          dinner: {
            completed: checkinMap.has(MealType.DINNER),
            data: checkinMap.get(MealType.DINNER) ?? null,
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

  create: protectedProcedure
    .input(
      z.object({
        mealType: z.nativeEnum(MealType),
        rating: z.number().min(1).max(5),
        notes: z.string().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find last checkin
      const lastCheckin = await ctx.db.dailyCheckin.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      // Get the user's active pet
      const activePet = await ctx.db.userPet.findFirst({
        where: { userId, isActive: true },
        select: { id: true, feedingStreak: true },
      });

      if (!activePet) {
        throw new Error("No active pet found");
      }

      let newStreak = 1;

      if (lastCheckin) {
        const expectedNext = getNextMeal(lastCheckin.mealType);

        const lastDateKey = lastCheckin.date.toISOString().split("T")[0];
        const currentDateKey = input.date.toISOString().split("T")[0];

        if (
          input.mealType === expectedNext &&
          currentDateKey !== undefined &&
          lastDateKey !== undefined &&
          (currentDateKey === lastDateKey ||
            new Date(currentDateKey) > new Date(lastDateKey))
        ) {
          newStreak = activePet.feedingStreak + 1;
        }
      }

      // Update streak + happiness
      await ctx.db.userPet.update({
        where: { id: activePet.id },
        data: {
          feedingStreak: newStreak,
          familiarity: {
            increment:
              HAPPINESS_CONFIG.actions.checkin + Math.min(newStreak, 10),
          },
        },
      });

      // Create checkin
      const newCheckin = await ctx.db.dailyCheckin.create({
        data: {
          userId,
          mealType: input.mealType,
          rating: input.rating,
          notes: input.notes,
          date: input.date,
        },
      });

      return {
        ...newCheckin,
        feedingStreak: newStreak,
      };
    }),
});
