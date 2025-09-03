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
  const router = useRouter();

  // Simple pet fetch - runs once on mount
  const {
    data: pet,
    isLoading: isPetLoading,
    refetch,
  } = api.pet.getCurrentUserPet.useQuery(undefined, {
    enabled: status === "authenticated" && !!session?.user, // Only run if authenticated
  });

  useEffect(() => {
    if (status === "unauthenticated" || !session?.user) {
      router.push("/api/auth/signin");
    }
  });

  useEffect(() => {
    if (!isPetLoading) {
      console.log("Pet fetch complete:", pet ? "Pet found" : "No pet found");
      console.log("Pet data:", pet);
      setLoading(false);
    }
  }, [isPetLoading, pet]);

  return (
    <PetContext.Provider
      value={{
        pet: pet || null,
        isLoading: isPetLoading,
        refetch,
      }}
    >
      <SplashScreen loading={loading}>{children}</SplashScreen>
    </PetContext.Provider>
  );
}
