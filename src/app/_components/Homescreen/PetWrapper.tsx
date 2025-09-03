// PetWrapper.tsx
"use client";

import { usePet } from "@/contexts/PetContext";
import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { set } from "zod";
import CreatePetModal from "./CreatePetModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PetWrapper = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  useEffect(() => {
    if (status === "unauthenticated" || !session?.user) {
      router.push("/api/auth/signin");
      return;
    }
  }, []);

  // Auto-create pet if none exists - RUNS ONLY ONCE
  useEffect(() => {
    if (
      !isLoading &&
      !pet &&
      !hasTriedCreateRef.current &&
      !createPetMutation.isPending &&
      status === "authenticated"
    ) {
      console.log("No pet found, auto-creating...");
      hasTriedCreateRef.current = true; // Mark as attempted
      createPetMutation.mutate();
    }
  }, [isLoading, pet, createPetMutation]);

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
