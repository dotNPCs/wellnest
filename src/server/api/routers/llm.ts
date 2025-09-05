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
  getMeditationMessage: protectedProcedure
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
    // TEST DB QUERY
    const caller = appRouter.createCaller(ctx);

    const reminder = await caller.llm.getFriendlyReminder();
    console.log("Reminder:", reminder);

    const meditation_text = await caller.llm.getMeditationMessage({
      meditation_duration: 300,
      time_started: "10:00 AM",
    });
    console.log("Meditation Text:", meditation_text);

    const post_meal_text = await caller.llm.getPostMealMessage({
      meal_description:
        "I was craving mala xiang guo, and it was a satisfying meal! My cravings have been fulfilled! I had a good time eating with my friends!",
    });
    console.log("Post Meal Text:", post_meal_text);

    const emoji = await caller.llm.getCurrentPersonaEmoji();
    console.log("Emoji:", emoji);

    const greeting = await caller.llm.getGreeting();
    console.log("Greeting:", greeting);

    const persona_state = await caller.llm.getCurrentPersonaState();
    console.log("Persona State:", persona_state);
    // END TEST DB QUERY

    const pet = await ctx.db.userPet.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        personas: {
          where: {
            pet: {
              isActive: true,
            },
          },
        },
      },
    });

    return pet;
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
