import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log(input.message);
      const response = "HELLO";

      return response;
    }),
});
