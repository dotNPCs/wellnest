import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const LLMRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return "pong!";
  }),
  findFirstPet: protectedProcedure.query(async ({ ctx }) => {
    const pet = await ctx.db.userPet.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return pet;
  }),
});
