/* eslint-disable @typescript-eslint/no-misused-promises */

// ClientLayout.tsx
"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import { api } from "@/trpc/react";
import { PetContext } from "@/contexts/PetContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isUpdatingPetPersona, setIsUpdatingPetPersona] = useState(false);
  const [hasRun, setHasRun] = useState(false); // ✅ track if mutation has already run
  const router = useRouter();

  const {
    data: pet,
    isLoading: isPetLoading,
    refetch,
  } = api.pet.getCurrentUserPet.useQuery(undefined, {
    enabled: status === "authenticated" && !!session?.user,
  });

  const createPetMoodLogRecordMutation =
    api.llm.createPetMoodLogRecord.useMutation({
      onMutate: () => setIsUpdatingPetPersona(true),
      onSettled: () => setIsUpdatingPetPersona(false),
      onError: (error) => {
        console.error("Error updating pet mood log:", error);
      },
      onSuccess: async () => {
        await refetch(); // ✅ refresh pet after update
      },
    });

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated" || !session?.user) {
      router.push("/api/auth/signin");
    }
  }, [status, session, router]);

  // Run mutation once if pet exists
  useEffect(() => {
    if (!isPetLoading && pet && !hasRun) {
      setHasRun(true); // ✅ mark as run to prevent loops
      createPetMoodLogRecordMutation.mutate();
    }
  }, [isPetLoading, pet, hasRun, createPetMoodLogRecordMutation]);

  useEffect(() => {
    if (!isPetLoading) {
      setLoading(false);
    }
  }, [isPetLoading]);

  return (
    <PetContext.Provider
      value={{
        pet: pet ?? null,
        isLoading: isPetLoading || isUpdatingPetPersona,
        refetch,
      }}
    >
      <SplashScreen loading={loading}>{children}</SplashScreen>
    </PetContext.Provider>
  );
}
