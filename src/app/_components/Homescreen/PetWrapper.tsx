// PetWrapper.tsx
"use client";

import { usePet } from "@/contexts/PetContext";
import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { set } from "zod";
import CreatePetModal from "./CreatePetModal";

const PetWrapper = () => {
  const { pet, isLoading, refetch } = usePet();
  const hasTriedCreateRef = useRef(false);
  const [showNewPetModal, setShowNewPetModal] = useState(false);

  // Auto-create pet mutation
  const createPetMutation = api.pet.createNewPet.useMutation({
    onSuccess: () => {
      console.log("Pet created successfully!");
      refetch(); // Refetch to get the new pet
      setShowNewPetModal(true);
    },
    onError: (error) => {
      console.error("Error creating pet:", error);
    },
  });

  // Auto-create pet if none exists - RUNS ONLY ONCE
  useEffect(() => {
    if (
      !isLoading &&
      !pet &&
      !hasTriedCreateRef.current &&
      !createPetMutation.isPending
    ) {
      console.log("No pet found, auto-creating...");
      hasTriedCreateRef.current = true; // Mark as attempted
      createPetMutation.mutate();
    }
  }, [isLoading, pet, createPetMutation]);

  //   if (isLoading) {
  //     return (
  //       <div className="flex h-[60vh] w-full items-center justify-center bg-gray-100 text-center">
  //         <div>Loading pet...</div>
  //       </div>
  //     );
  //   }

  //   if (createPetMutation.isPending) {
  //     return (
  //       <div className="flex h-[60vh] w-full items-center justify-center bg-blue-100 text-center">
  //         <div>Creating your new pet...</div>
  //       </div>
  //     );
  //   }

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center bg-green-500 text-center text-white">
      <h1 className="mb-4 text-2xl font-bold">Pet Dashboard</h1>

      {pet ? (
        <div className="space-y-4">
          <div className="rounded bg-white p-4 text-black">
            <h3 className="text-lg font-semibold">{pet.name}</h3>

            <p className="text-xs text-gray-500">ID: {pet.id}</p>
          </div>
        </div>
      ) : (
        <div className="rounded bg-red-200 p-4 text-red-800">
          <p>Something went wrong - no pet found or created</p>
        </div>
      )}
      <CreatePetModal
        isOpen={showNewPetModal}
        onClose={() => setShowNewPetModal(false)}
      />
    </div>
  );
};

export default PetWrapper;
