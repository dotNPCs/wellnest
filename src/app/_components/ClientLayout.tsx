// ClientLayout.tsx
"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import { api } from "@/trpc/react";
import { PetContext } from "@/contexts/PetContext";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [loading, setLoading] = useState(true);

  // Simple pet fetch - runs once on mount
  const {
    data: pet,
    isLoading: isPetLoading,
    refetch,
  } = api.pet.getCurrentUserPet.useQuery();

  useEffect(() => {
    if (!isPetLoading) {
      console.log("Pet fetch complete:", pet ? "Pet found" : "No pet found");
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
