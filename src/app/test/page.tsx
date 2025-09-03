"use client";
import { TRPCError, type inferProcedureOutput } from "@trpc/server";
import type { appRouter } from "@/server/api/root";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
type UserPet = inferProcedureOutput<(typeof appRouter)["llm"]["findFirstPet"]>;

type Props = {
  pet: UserPet;
};
const Page = ({ pet }: Props) => {
  return (
    <div className="flex h-full flex-col">
      <h1>Hi! Your pet is {pet?.name}</h1>

      <div className="flex space-x-2">
        <Input />
        <Button>Submit</Button>
      </div>

      <div></div>
    </div>
  );
};

export default Page;
