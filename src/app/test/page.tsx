"use client";
import { type inferProcedureOutput } from "@trpc/server";
import type { appRouter } from "@/server/api/root";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { api } from "@/trpc/react";
import { TRPCClientError } from "@trpc/client";
type UserPet = inferProcedureOutput<(typeof appRouter)["llm"]["findFirstPet"]>;

type Props = {
  pet: UserPet;
};
const Page = ({ pet }: Props) => {
  const [query, setQuery] = useState<string>("");
  const [LLMResponse, setLLMResponse] = useState<string>("");

  const { isLoading, refetch } = api.llm.chat.useQuery(
    {
      message: query,
    },
    { enabled: false, retry: false },
  );

  const handleSubmit = async () => {
    try {
      const { data } = await refetch({
        throwOnError: true,
      });

      if (data) setLLMResponse(data);
    } catch (e) {
      console.log(e);
      if (e instanceof TRPCClientError) {
        setLLMResponse(e.message);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (e?.data?.zodError?.fieldErrors?.message?.length > 0)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          setLLMResponse(e.data.zodError.fieldErrors.message[0]);
      }
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <Textarea className="resize-none" value={JSON.stringify(pet)} disabled />

      <div className="flex space-x-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button
          type="button"
          onClick={handleSubmit}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Submit
        </Button>
      </div>

      <div className="h-full">
        <Textarea className="h-full!" value={LLMResponse} disabled />
      </div>
    </div>
  );
};

export default Page;
