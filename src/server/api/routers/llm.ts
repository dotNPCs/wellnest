import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { GoogleGenAI } from "@google/genai";
import { TRPCError } from "@trpc/server";
import { appRouter } from "@/server/api/root";
import type { UserMood } from "@prisma/client";
import { tryParseToObject } from "@/server/llm/utils";

// Prompt Imports
import { getPersonaChangePrompt } from "@/server/llm/prompts/persona-change";
import { getFriendlyReminderPrompt } from "@/server/llm/prompts/friendly-reminder";
import { getPostMeditationMessagePrompt } from "@/server/llm/prompts/post-meditation-message";
import { getPostMealMessagePrompt } from "@/server/llm/prompts/post-meal-message";
import { getCurrentPersonaEmojiPrompt } from "@/server/llm/prompts/current-persona-emoji";
import { getGreetingPrompt } from "@/server/llm/prompts/greeting";
import { getCurrentPersonaStatePrompt } from "@/server/llm/prompts/current-persona-state";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const config = {
  thinkingConfig: {
    thinkingBudget: 0,
  },
};

const model = "gemini-2.5-flash-lite";

export const LLMRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return "pong!";
  }),
  triggerPersonaUpdateWithInput: protectedProcedure
    .input(
      z.object({
        message: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { message } = input;

      const persona = await ctx.db.userPetPersona.findFirst({
        where: {
          pet: {
            isActive: true,
            userId: ctx.session.user.id,
          },
        },
        select: {
          personaJson: true,
          id: true,
        },
      });

      if (!persona)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active pet persona found",
        });

      const { personaJson } = persona;

      const prompt = getPersonaChangePrompt(message, personaJson as object);

      const response = await ai.models.generateContent({
        model,
        config: {
          ...config,
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const changedPersona = tryParseToObject(response);

      if (!changedPersona || typeof changedPersona !== "object") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse changed persona response",
        });
      }

      // Upsert UserPetPersona with changed persona
      const updated_persona = await ctx.db.userPetPersona.update({
        where: {
          id: persona.id,
        },
        data: { personaJson: changedPersona },
      });

      return updated_persona;
    }),

  createPetMoodLogRecord: protectedProcedure.mutation(async ({ ctx }) => {
    const caller = appRouter.createCaller(ctx);

    const persona = await ctx.db.userPetPersona.findFirst({
      where: {
        pet: {
          isActive: true,
          userId: ctx.session.user.id,
        },
      },
      select: {
        personaJson: true,
        petId: true,
        id: true,
      },
    });

    if (!persona)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active pet persona found",
      });

    const { emoji } = (await caller.llm.getCurrentPersonaEmoji()) as {
      emoji: UserMood;
    };

    const { dialogue, mood } = (await caller.llm.getCurrentPersonaState()) as {
      dialogue: string;
      mood: string;
    };

    const created = await ctx.db.petMoodLog.create({
      data: {
        petId: persona.petId,
        happiness: 10,
        trigger: "UNKNOWN",
        mood: emoji,
        dialogue: dialogue,
        status: mood,
      },
    });

    return created;
  }),
  upsertPersonChangeWithMeditation: protectedProcedure
    .input(
      z.object({
        meditation_duration: z.number(),
        time_started: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { meditation_duration, time_started } = input;
      const caller = appRouter.createCaller(ctx);

      const persona = await ctx.db.userPetPersona.findFirst({
        where: {
          pet: {
            isActive: true,
            userId: ctx.session.user.id,
          },
        },
        select: {
          personaJson: true,
          id: true,
        },
      });

      if (!persona)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active pet persona found",
        });

      const userInput = {
        instructions:
          "Based on the meditation data provided below, modify [Persona.json].",
        meditation_duration,
        time_started,
      };

      const { personaJson } = persona;

      // Get Changed Persona
      const personaChangePrompt = getPersonaChangePrompt(
        userInput,
        personaJson as object,
      );
      const changedPersonaResponse = await ai.models.generateContent({
        model,
        config: {
          ...config,
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: personaChangePrompt }] }],
      });
      const changed_persona = tryParseToObject(changedPersonaResponse);

      if (!changed_persona || typeof changed_persona !== "object") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse changed persona response",
        });
      }

      // Upsert UserPetPersona with changed persona
      await ctx.db.userPetPersona.update({
        where: {
          id: persona.id,
        },
        data: { personaJson: changed_persona },
      });

      // Get Post Meditation Message
      const meditation_response = (await caller.llm.getPostMeditationMessage({
        meditation_duration,
        time_started,
      })) as { meditation_response: string };

      return meditation_response;
    }),

  getCurrentPersonaState: protectedProcedure.query(async ({ ctx }) => {
    const caller = appRouter.createCaller(ctx);
    const persona = await caller.llm.getActivePetPersonaJson();

    const prompt = getCurrentPersonaStatePrompt(persona);

    const response = await ai.models.generateContent({
      model,
      config: {
        ...config,

        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const response_object = tryParseToObject(response);
    return response_object as { mood: string; dialogue: string };
  }),
  getGreeting: protectedProcedure.query(async ({ ctx }) => {
    const caller = appRouter.createCaller(ctx);
    const persona = await caller.llm.getActivePetPersonaJson();

    const prompt = getGreetingPrompt(persona);

    const response = await ai.models.generateContent({
      model,
      config: {
        ...config,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response_object = tryParseToObject(response);

    return response_object as { greeting: string };
  }),
  getCurrentPersonaEmoji: protectedProcedure.query(async ({ ctx }) => {
    const caller = appRouter.createCaller(ctx);
    const persona = await caller.llm.getActivePetPersonaJson();

    const prompt = getCurrentPersonaEmojiPrompt(persona);

    const response = await ai.models.generateContent({
      model,
      config: {
        ...config,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response_object = tryParseToObject(response);

    return response_object as { emoji: UserMood };
  }),
  getPostMealMessage: protectedProcedure
    .input(
      z.object({
        meal_description: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const caller = appRouter.createCaller(ctx);
      const persona = await caller.llm.getActivePetPersonaJson();
      const { meal_description } = input;

      const prompt = getPostMealMessagePrompt(persona, meal_description);
      const response = await ai.models.generateContent({
        model,
        config: {
          ...config,
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const response_object = tryParseToObject(response);

      return response_object as { post_meal_mood: string };
    }),
  getPostMeditationMessage: protectedProcedure
    .input(
      z.object({
        meditation_duration: z.number(),
        time_started: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const caller = appRouter.createCaller(ctx);
      const persona = await caller.llm.getActivePetPersonaJson();

      const { meditation_duration, time_started } = input;

      const prompt = getPostMeditationMessagePrompt(
        persona,
        meditation_duration,
        time_started,
      );

      const response = await ai.models.generateContent({
        model,
        config: {
          ...config,
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const response_object = tryParseToObject(response);

      return response_object as { meditation_response: string };
    }),
  getActivePetPersonaJson: protectedProcedure.query(async ({ ctx }) => {
    const persona = await ctx.db.userPetPersona.findFirst({
      where: {
        pet: {
          isActive: true,
          userId: ctx.session.user.id,
        },
      },
      select: {
        personaJson: true,
        id: true,
      },
    });

    if (!persona)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active pet persona found",
      });

    const { personaJson } = persona;

    return personaJson as object;
  }),
  getFriendlyReminder: protectedProcedure.query(async ({ ctx }) => {
    const caller = appRouter.createCaller(ctx);
    const persona = await caller.llm.getActivePetPersonaJson();

    const prompt = getFriendlyReminderPrompt(persona);

    const response = await ai.models.generateContent({
      model,
      config: {
        ...config,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response_object = tryParseToObject(response);

    return response_object as { reminder: string };
  }),
  getChangedPersona: protectedProcedure
    .input(
      z.object({
        message: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const caller = appRouter.createCaller(ctx);
      const persona = await caller.llm.getActivePetPersonaJson();

      const prompt = getPersonaChangePrompt(input.message, persona);

      const response = await ai.models.generateContent({
        model,
        config: {
          ...config,
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const response_object = tryParseToObject(response);

      return response_object;
    }),
  findFirstPet: protectedProcedure.query(async ({ ctx }) => {
    const persona = await ctx.db.userPetPersona.findFirst({
      where: {
        pet: {
          isActive: true,
          userId: ctx.session.user.id,
        },
      },
      select: {
        personaJson: true,
        id: true,
      },
    });

    if (!persona)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active pet persona found",
      });

    return persona;
  }),

  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      const response = await ai.models.generateContent({
        model,
        config,
        contents: [{ role: "user", parts: [{ text: input.message }] }],
      });

      return response.text;
    }),
});
