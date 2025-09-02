import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { PetRarity, UserMood } from "@prisma/client";

export const petRouter = createTRPCRouter({
  // Get current user's active pets
  getCurrentUserPets: protectedProcedure.query(async ({ ctx }) => {
    const pets = await ctx.db.userPet.findMany({
      where: {
        userId: ctx.session.user.id,
        isActive: true,
      },
      include: {
        petType: true,
        moodLogs: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get latest mood log
        },
        personas: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get latest persona
        },
      },
      orderBy: { adoptedAt: "desc" },
    });

    return pets;
  }),

  // Get current pet mood for a specific pet
  getCurrentPetMood: protectedProcedure
    .input(
      z.object({
        petId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify pet belongs to user
      const pet = await ctx.db.userPet.findFirst({
        where: {
          id: input.petId,
          userId: ctx.session.user.id,
          isActive: true,
        },
        include: {
          petType: true,
          moodLogs: {
            orderBy: { createdAt: "desc" },
            take: 5, // Get recent mood history
          },
          personas: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!pet) {
        throw new Error("Pet not found or does not belong to user");
      }

      return {
        pet,
        currentMood: pet.currentMood,
        happiness: pet.happiness,
        recentMoodLogs: pet.moodLogs,
        currentPersona: pet.personas[0] || null,
      };
    }),

  // Create new pet
  createNewPet: protectedProcedure
    .input(
      z.object({
        petTypeId: z.string().cuid(),
        name: z.string().min(1).max(50).optional(),
        isInFarm: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pet type exists
      const petType = await ctx.db.petType.findUnique({
        where: { id: input.petTypeId },
      });

      if (!petType) {
        throw new Error("Pet type not found");
      }

      // Create the pet with initial mood log and persona
      const result = await ctx.db.$transaction(async (tx) => {
        // Create the pet
        const newPet = await tx.userPet.create({
          data: {
            userId: ctx.session.user.id,
            petTypeId: input.petTypeId,
            name: input.name,
            happiness: 20.0, // Start with neutral happiness
            currentMood: "NEUTRAL",
          },
          include: {
            petType: true,
          },
        });

        // Create initial mood log
        const initialMoodLog = await tx.petMoodLog.create({
          data: {
            petId: newPet.id,
            mood: "NEUTRAL",
            happiness: 20.0,
            status: "Hoping to see if I could find a loving home!",
            trigger: "ADOPTION",
          },
        });

        // Create initial persona
        const initialPersona = await tx.userPetPersona.create({
          data: {
            petId: newPet.id,
            personaJson: {},
          },
        });

        // Award adoption points to user
        await tx.user.update({
          where: { id: ctx.session.user.id },
          data: {
            totalPoints: {
              increment: 50, // Adoption bonus
            },
          },
        });

        return {
          pet: newPet,
          initialMoodLog,
          initialPersona,
        };
      });

      return result;
    }),

  // Get available pet types for adoption
  getAvailablePetTypes: protectedProcedure.query(async ({ ctx }) => {
    const petTypes = await ctx.db.petType.findMany({
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
    });

    return petTypes;
  }),

  // Update pet mood (for interactions)
  updatePetMood: protectedProcedure
    .input(
      z.object({
        petId: z.string().cuid(),
        mood: z.enum([
          "ANXIOUS",
          "STRESSED",
          "NEUTRAL",
          "CONTENT",
          "HAPPY",
          "EXCITED",
          "GRATEFUL",
          "CALM",
          "ENERGETIC",
          "TIRED",
        ]),
        happinessChange: z.number().min(-20).max(20),
        status: z.string().max(200).optional(),
        trigger: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pet belongs to user
      const existingPet = await ctx.db.userPet.findFirst({
        where: {
          id: input.petId,
          userId: ctx.session.user.id,
          isActive: true,
        },
      });

      if (!existingPet) {
        throw new Error("Pet not found or does not belong to user");
      }

      const result = await ctx.db.$transaction(async (tx) => {
        // Calculate new happiness (clamp between 0-100)
        const newHappiness = Math.max(
          0,
          Math.min(100, existingPet.happiness + input.happinessChange),
        );

        // Update pet
        const updatedPet = await tx.userPet.update({
          where: { id: input.petId },
          data: {
            currentMood: input.mood,
            happiness: newHappiness,
            totalInteractions: {
              increment: 1,
            },
          },
          include: {
            petType: true,
          },
        });

        // Create mood log entry
        const moodLog = await tx.petMoodLog.create({
          data: {
            petId: input.petId,
            mood: input.mood,
            happiness: newHappiness,
            status: input.status,
            trigger: input.trigger,
          },
        });

        return {
          pet: updatedPet,
          moodLog,
        };
      });

      return result;
    }),

  // Feed pet (increases happiness and affects mood)
  feedPet: protectedProcedure
    .input(
      z.object({
        petId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pet belongs to user
      const existingPet = await ctx.db.userPet.findFirst({
        where: {
          id: input.petId,
          userId: ctx.session.user.id,
          isActive: true,
        },
      });

      if (!existingPet) {
        throw new Error("Pet not found or does not belong to user");
      }

      const result = await ctx.db.$transaction(async (tx) => {
        // Calculate happiness boost (diminishing returns if already very happy)
        const happinessBoost = existingPet.happiness > 80 ? 5 : 10;
        const newHappiness = Math.min(
          100,
          existingPet.happiness + happinessBoost,
        );

        // Determine new mood based on happiness
        let newMood: UserMood = "CONTENT";
        if (newHappiness >= 90) newMood = "EXCITED";
        else if (newHappiness >= 70) newMood = "HAPPY";
        else if (newHappiness >= 50) newMood = "CONTENT";
        else if (newHappiness >= 30) newMood = "NEUTRAL";
        else newMood = "TIRED";

        // Update pet
        const updatedPet = await tx.userPet.update({
          where: { id: input.petId },
          data: {
            currentMood: newMood,
            happiness: newHappiness,
            feedingStreak: {
              increment: 1,
            },
            totalInteractions: {
              increment: 1,
            },
          },
          include: {
            petType: true,
          },
        });

        // Create mood log
        const moodLog = await tx.petMoodLog.create({
          data: {
            petId: input.petId,
            mood: newMood,
            happiness: newHappiness,
            status: "Yummy! Thanks for the meal!",
            trigger: "FEEDING",
          },
        });

        // Award points to user
        await tx.user.update({
          where: { id: ctx.session.user.id },
          data: {
            totalPoints: {
              increment: 5, // Points for caring for pet
            },
          },
        });

        return {
          pet: updatedPet,
          moodLog,
          pointsEarned: 5,
        };
      });

      return result;
    }),

  // Get pet statistics
  getPetStats: protectedProcedure
    .input(
      z.object({
        petId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const pet = await ctx.db.userPet.findFirst({
        where: {
          id: input.petId,
          userId: ctx.session.user.id,
          isActive: true,
        },
        include: {
          petType: true,
          moodLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          personas: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!pet) {
        throw new Error("Pet not found or does not belong to user");
      }

      // Calculate some basic stats
      const daysSinceAdoption = Math.floor(
        (new Date().getTime() - pet.adoptedAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const averageHappiness =
        pet.moodLogs.reduce((sum, log) => sum + log.happiness, 0) /
        Math.max(pet.moodLogs.length, 1);

      return {
        pet,
        stats: {
          daysSinceAdoption,
          averageHappiness: Math.round(averageHappiness * 10) / 10,
          totalInteractions: pet.totalInteractions,
          feedingStreak: pet.feedingStreak,
          careStreak: pet.careStreak,
        },
        currentPersona: pet.personas[0] || null,
        recentMoodHistory: pet.moodLogs,
      };
    }),
});
