/* eslint-disable @typescript-eslint/no-misused-promises */

// ClientLayout.tsx
"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import { api } from "@/trpc/react";
import { PetContext } from "@/contexts/PetContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { getCurrentDateTime } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isUpdatingPetPersona, setIsUpdatingPetPersona] = useState(false);
  const [hasRun, setHasRun] = useState(false); // ✅ track if mutation has already run
  const router = useRouter();

  const utils = api.useUtils();

  const {
    data: pet,
    isLoading: isPetLoading,
    refetch: originalRefetch,
  } = api.pet.getCurrentUserPet.useQuery(undefined, {
    enabled: status === "authenticated" && !!session?.user,
    staleTime: 1000 * 30, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true,
  });

  const createPetMoodLogRecordMutation =
    api.llm.createPetMoodLogRecord.useMutation({
      onSettled: () => setIsUpdatingPetPersona(false),
      onError: (error) => {
        console.error("Error updating pet mood log:", error);
      },
      onSuccess: async () => {
        await refetchWithInvalidation();
      },
    });

  const updatePersonaJson = api.llm.triggerPersonaUpdateWithInput.useMutation({
    onMutate: () => setIsUpdatingPetPersona(true),
    onError: (error) => {
      console.error("Error updating pet persona:", error);
    },
    onSuccess: async () => {
      createPetMoodLogRecordMutation.mutate();
    },
  });

  const refetchWithInvalidation = async () => {
    try {
      // Invalidate cache first to ensure fresh data
      await utils.pet.getCurrentUserPet.invalidate();
      // Then refetch to get fresh data immediately
      return await originalRefetch();
    } catch (error) {
      console.error("Failed to invalidate and refetch pet data:", error);
      throw error;
    }
  };

  // Helper function to get current date and time in SGT

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
      const currentDateTime = getCurrentDateTime();

      updatePersonaJson.mutate({
        message: `Time has passed to: ${currentDateTime}`,
      });
    }
  }, [isPetLoading, pet, hasRun, updatePersonaJson]);

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
        refetch: refetchWithInvalidation,
      }}
    >
      <SplashScreen loading={loading}>{children}</SplashScreen>
    </PetContext.Provider>
  );
}
