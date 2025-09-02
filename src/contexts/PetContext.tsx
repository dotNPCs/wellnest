// contexts/PetContext.tsx
"use client";

import { createContext, useContext } from "react";

import { type UserPet } from "@prisma/client";

interface PetContextType {
  pet: UserPet | null;
  isLoading: boolean;
  refetch: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const usePet = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error("usePet must be used within a PetProvider");
  }
  return context;
};

export { PetContext };
