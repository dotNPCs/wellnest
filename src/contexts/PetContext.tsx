// contexts/PetContext.tsx
"use client";

import { createContext, useContext } from "react";

import {
  type UserPet,
  type PetMoodLog,
  type UserPetPersona,
} from "@prisma/client";

interface ExtraPetData {
  moodLogs?: PetMoodLog[];
  personas?: UserPetPersona[];

  // add whatever else you need
}

export type Pet = UserPet & ExtraPetData;

interface PetContextType {
  pet: Pet | null;
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
