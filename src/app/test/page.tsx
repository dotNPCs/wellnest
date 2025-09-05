"use client";
import { type inferProcedureOutput } from "@trpc/server";
import type { appRouter } from "@/server/api/root";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { api } from "@/trpc/react";
import { TRPCClientError } from "@trpc/client";
import { usePet } from "@/contexts/PetContext";

type UserPet = inferProcedureOutput<(typeof appRouter)["llm"]["findFirstPet"]>;

const Page = () => {
  const [query, setQuery] = useState<string>("");
  const [LLMResponse, setLLMResponse] = useState<string>(
    JSON.stringify(pet?.personas[0]?.personaJson) ?? "",
  );

  const { refetch, isFetching } = api.llm.getChangedPersona.useQuery(
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

      if (data) setLLMResponse(JSON.stringify(data));
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

  // Show loading state while pet data is being fetched
  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
<<<<<<< HEAD
      <Textarea
        className="resize-none"
        value={JSON.stringify(pet?.personas?.[0]?.personaJson)}
        disabled
      />
=======
      <Textarea className="resize-none" value={LLMResponse} disabled />
>>>>>>> d694341 (feat: enhance persona handling and response formatting in LLMRouter)

      <div className="flex space-x-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button
          type="button"
          onClick={handleSubmit}
          className="cursor-pointer"
          disabled={isFetching}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Page;
