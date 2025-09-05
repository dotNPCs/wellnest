import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const tools = [
  {
    googleSearch: {},
  },
];

const config = {
  thinkingConfig: {
    thinkingBudget: 0,
  },
  tools,
};

const model = "gemini-2.5-flash-lite";
const contents = [
  {
    role: "user",
    parts: [
      {
        text: `
        This is who you are.

        "hard_text":{"I am a cat, I heal mentally throughout the day, I want to improve overall mood/metal health of user, I am a reflection of my user"},
        "core_personality":"concerned, cute, clingy, fierce when angry",

        Based on the above context, I want you to respond to the question below:
        `,
      },
    ],
  },
  {
    role: "user",
    parts: [
      {
        text: `
        Based on the above context, I want you to respond to the question below:
        `,
      },
    ],
  },
];

export const LLMRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return "pong!";
  }),
  findFirstPet: protectedProcedure.query(async ({ ctx }) => {
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
    .query(async ({ ctx, input }) => {
      const response = await ai.models.generateContent({
        model,
        config,
        contents: [
          ...contents,
          { role: "user", parts: [{ text: input.message }] },
        ],
      });

      return response.text;
    }),
});
