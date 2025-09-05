import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { PetRarity, UserMood } from "@prisma/client";

export const petRouter = createTRPCRouter({
  // Get current user's active pets
  getCurrentUserPet: protectedProcedure.query(async ({ ctx }) => {
    const pet = await ctx.db.userPet.findFirst({
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

    if (pet) {
      const updatePet = await ctx.db.userPet.update({
        where: { id: pet.id },
        data: {
          fetchedAt: new Date(),
        },
      });
    }

    return pet;
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
        familiarity: pet.familiarity,
        recentMoodLogs: pet.moodLogs,
        currentPersona: pet.personas[0] ?? null,
      };
    }),

  // Create new pet
  createNewPet: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Get a random pet type
      const randomPetTypes = await ctx.db.$queryRaw<
        { id: string; name: string }[]
      >`SELECT * FROM "PetType" ORDER BY RANDOM() LIMIT 1`;

      if (!randomPetTypes || randomPetTypes.length === 0) {
        throw new Error("No pet types available in database");
      }

      const randomPetType = randomPetTypes[0];

      if (!randomPetType) {
        throw new Error("Failed to select a random pet type");
      }

      // Create the pet first
      const newPet = await ctx.db.userPet.create({
        data: {
          userId: ctx.session.user.id,
          petTypeId: randomPetType.id,
          name: randomPetType.name,
          familiarity: 10.0,
          currentMood: "NEUTRAL",
        },
        include: {
          petType: true,
        },
      });

      // Create related records (these will rollback manually if any fail)
      try {
        // Create initial mood log
        const initialMoodLog = await ctx.db.petMoodLog.create({
          data: {
            petId: newPet.id,
            mood: "NEUTRAL",
            happiness: 10.0,
            dialogue: "Hoping to find a loving home!",
            status: "Your new pet is excited to meet you!",
            trigger: "ADOPTION",
          },
        });

        // Create initial persona
        const initialPersona = await ctx.db.userPetPersona.create({
          data: {
            petId: newPet.id,
            personaJson: {
              cheerful: 5.0,
              calm: 5.0,
              playful: 5.0,
              empathetic: 5.0,
              shy: 5.0,
              quirky: 5.0,
              description:
                "A newly adopted pet with balanced personality traits",
              confidence: 1.0,
              trigger: "Initial adoption personality assessment",
            },
          },
        });

        // Award adoption points to user
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            totalPoints: {
              increment: 50,
            },
          },
        });

        return {
          pet: newPet,
          initialMoodLog,
          initialPersona,
        };
      } catch (relatedError) {
        // If any related record creation fails, delete the pet to maintain consistency
        await ctx.db.userPet.delete({
          where: { id: newPet.id },
        });
        throw relatedError;
      }
    } catch (error) {
      console.error("Error creating new pet:", error);

      if (error instanceof Error) {
        throw new Error(`Failed to create pet: ${error.message}`);
      }

      throw new Error("An unexpected error occurred while creating the pet");
    }
  }),
  // Get available pet types for adoption
  getAvailablePetTypes: protectedProcedure.query(async ({ ctx }) => {
    const petTypes = await ctx.db.petType.findMany({
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
    });

    return petTypes;
  }),

  // // Update pet mood (for interactions)
  // updatePetMood: protectedProcedure
  //   .input(
  //     z.object({
  //       petId: z.string().cuid(),
  //       mood: z.enum([
  //         "ANXIOUS",
  //         "STRESSED",
  //         "NEUTRAL",
  //         "CONTENT",
  //         "HAPPY",
  //         "EXCITED",
  //         "GRATEFUL",
  //         "CALM",
  //         "ENERGETIC",
  //         "TIRED",
  //       ]),
  //       happinessChange: z.number().min(-20).max(20),
  //       status: z.string().max(200).optional(),
  //       trigger: z.string().max(100).optional(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify pet belongs to user
  //     const existingPet = await ctx.db.userPet.findFirst({
  //       where: {
  //         id: input.petId,
  //         userId: ctx.session.user.id,
  //         isActive: true,
  //       },
  //     });

  //     if (!existingPet) {
  //       throw new Error("Pet not found or does not belong to user");
  //     }

  //     const result = await ctx.db.$transaction(async (tx) => {
  //       // Calculate new happiness (clamp between 0-100)
  //       const newFamiliarity = Math.max(
  //         0,
  //         Math.min(100, existingPet.familiarity + input.happinessChange),
  //       );

  //       // Update pet
  //       const updatedPet = await tx.userPet.update({
  //         where: { id: input.petId },
  //         data: {
  //           currentMood: input.mood,
  //           familiarity: newFamiliarity,
  //           totalInteractions: {
  //             increment: 1,
  //           },
  //         },
  //         include: {
  //           petType: true,
  //         },
  //       });

  //       // Create mood log entry
  //       const moodLog = await tx.petMoodLog.create({
  //         data: {
  //           happiness: newFamiliarity,
  //           petId: input.petId,
  //           mood: input.mood,
  //           status: input.status,
  //         },
  //       });

  //       return {
  //         pet: updatedPet,
  //         moodLog,
  //       };
  //     });

  //     return result;
  //   }),

  // Feed pet (increases happiness and affects mood)
  // feedPet: protectedProcedure
  //   .input(
  //     z.object({
  //       petId: z.string().cuid(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify pet belongs to user
  //     const existingPet = await ctx.db.userPet.findFirst({
  //       where: {
  //         id: input.petId,
  //         userId: ctx.session.user.id,
  //         isActive: true,
  //       },
  //     });

  //     if (!existingPet) {
  //       throw new Error("Pet not found or does not belong to user");
  //     }

  //     const result = await ctx.db.$transaction(async (tx) => {
  //       // Calculate happiness boost (diminishing returns if already very happy)
  //       const happinessBoost = existingPet.happiness > 80 ? 5 : 10;
  //       const newHappiness = Math.min(
  //         100,
  //         existingPet.happiness + happinessBoost,
  //       );

  //       // Determine new mood based on happiness
  //       let newMood: UserMood = "CONTENT";
  //       if (newHappiness >= 90) newMood = "EXCITED";
  //       else if (newHappiness >= 70) newMood = "HAPPY";
  //       else if (newHappiness >= 50) newMood = "CONTENT";
  //       else if (newHappiness >= 30) newMood = "NEUTRAL";
  //       else newMood = "TIRED";

  //       // Update pet
  //       const updatedPet = await tx.userPet.update({
  //         where: { id: input.petId },
  //         data: {
  //           currentMood: newMood,
  //           happiness: newHappiness,
  //           feedingStreak: {
  //             increment: 1,
  //           },
  //           totalInteractions: {
  //             increment: 1,
  //           },
  //         },
  //         include: {
  //           petType: true,
  //         },
  //       });

  //       // Create mood log
  //       const moodLog = await tx.petMoodLog.create({
  //         data: {
  //           petId: input.petId,
  //           mood: newMood,
  //           happiness: newHappiness,
  //           status: "Yummy! Thanks for the meal!",
  //           trigger: "FEEDING",
  //         },
  //       });

  //       // Award points to user
  //       await tx.user.update({
  //         where: { id: ctx.session.user.id },
  //         data: {
  //           totalPoints: {
  //             increment: 5, // Points for caring for pet
  //           },
  //         },
  //       });

  //       return {
  //         pet: updatedPet,
  //         moodLog,
  //         pointsEarned: 5,
  //       };
  //     });

  //     return result;
  //   }),

  // Get pet statistics
  // getPetStats: protectedProcedure
  //   .input(
  //     z.object({
  //       petId: z.string().cuid(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const pet = await ctx.db.userPet.findFirst({
  //       where: {
  //         id: input.petId,
  //         userId: ctx.session.user.id,
  //         isActive: true,
  //       },
  //       include: {
  //         petType: true,
  //         moodLogs: {
  //           orderBy: { createdAt: "desc" },
  //           take: 10,
  //         },
  //         personas: {
  //           orderBy: { createdAt: "desc" },
  //           take: 1,
  //         },
  //       },
  //     });

  //     if (!pet) {
  //       throw new Error("Pet not found or does not belong to user");
  //     }

  //     // Calculate some basic stats
  //     const daysSinceAdoption = Math.floor(
  //       (new Date().getTime() - pet.adoptedAt.getTime()) /
  //         (1000 * 60 * 60 * 24),
  //     );

  //     const averageHappiness =
  //       pet.moodLogs.reduce((sum, log) => sum + log.happiness, 0) /
  //       Math.max(pet.moodLogs.length, 1);

  //     return {
  //       pet,
  //       stats: {
  //         daysSinceAdoption,
  //         averageHappiness: Math.round(averageHappiness * 10) / 10,
  //         totalInteractions: pet.totalInteractions,
  //         feedingStreak: pet.feedingStreak,
  //         careStreak: pet.careStreak,
  //       },
  //       currentPersona: pet.personas[0] || null,
  //       recentMoodHistory: pet.moodLogs,
  //     };
  //   }),
});
