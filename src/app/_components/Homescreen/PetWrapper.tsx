// PetWrapper.tsx
"use client";

import { usePet } from "@/contexts/PetContext";
import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { set } from "zod";
import CreatePetModal from "./CreatePetModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TypewriterText from "./DialogueTypewriterText";
import PixelBackground from "../Pixel/PixelBackground";
import PetSprite from "../Pixel/PetSprite";
import SpriteDebugger from "../Pixel/PetDebugger";
import { Dropdown } from "./DropdownMenu";
import Image from "next/image";

const PetWrapper = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { pet, isLoading, refetch } = usePet();
  const hasTriedCreateRef = useRef(false);
  const [showNewPetModal, setShowNewPetModal] = useState(false);
  const [showMoodStatus, setShowMoodStatus] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<string>("");

  // Auto-create pet mutation
  const createPetMutation = api.pet.createNewPet.useMutation({
    onSuccess: () => {
      refetch(); // Refetch to get the new pet
      setShowNewPetModal(true);
    },
    onError: (error) => {
      console.error("Error creating pet:", error);
    },
  });

  const userCheckInToAppMutation = api.checkin.createCheckInToApp.useMutation();

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
      hasTriedCreateRef.current = true; // Mark as attempted
      createPetMutation.mutate();
      userCheckInToAppMutation.mutate();
    }
  }, [isLoading, pet, createPetMutation]);

  useEffect(() => {}, [pet]);

  // Update current dialogue when pet data changes
  useEffect(() => {
    if (pet?.moodLogs?.[0]?.dialogue) {
      setCurrentDialogue(pet.moodLogs[0].dialogue);
    }
    if (!pet?.moodLogs?.[0]?.status) {
      setShowMoodStatus(true);
    }
  }, [pet?.moodLogs]);

  // Function to get mood emoji based on status
  const getMoodEmoji = (status: string) => {
    if (status.toLowerCase().includes("happy")) return "/emojis/happy.png";
    if (status.toLowerCase().includes("sad")) return "/emojis/sad.png";
    if (status.toLowerCase().includes("angry")) return "/emojis/angry.png";
    if (status.toLowerCase().includes("excited")) return "/emojis/excited.png";
    if (status.toLowerCase().includes("tired")) return "/emojis/tired.png";
    if (status.toLowerCase().includes("anxious")) return "/emojis/anxious.png";
    if (status.toLowerCase().includes("stressed"))
      return "/emojis/stressed.png";
    if (status.toLowerCase().includes("calm")) return "/emojis/calm.png";
    if (status.toLowerCase().includes("energetic"))
      return "/emojis/energetic.png";
    if (status.toLowerCase().includes("grateful"))
      return "/emojis/grateful.png";
    if (status.toLowerCase().includes("content")) return "/emojis/content.png";
    return "/emojis/neutral.png";
  };

  // Function to calculate days since pet creation
  const getDaysSinceCreation = (createdAt: Date) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to get current time in HH:MM AM/PM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative flex h-[60dvh] w-full max-w-[768px] touch-none flex-col items-center justify-center overflow-hidden text-center text-white">
      {/* Pixel Background with Animations */}
      <div className="fixed top-4 left-4 z-10">
        <Dropdown />
      </div>

      <PixelBackground />
      {/* Pet Sprite */}
      {pet && <PetSprite pet={pet} mood={pet.currentMood} />}
      {/* Game UI Overlay */}
      <div className="pointer-events-none absolute inset-0">
        {pet && (
          <div className="font-pixel pointer-events-none fixed top-10 left-1/2 z-10 w-1/2 -translate-x-1/2 font-bold whitespace-nowrap text-white text-shadow-sm">
            <p>
              DAY {getDaysSinceCreation(pet.adoptedAt)} |{" "}
              {getCurrentTime()}{" "}
            </p>
          </div>
        )}

        {/* Mood Status */}
        {pet &&
          pet.moodLogs &&
          pet.moodLogs.length > 0 &&
          pet.moodLogs[0]?.status && (
            <div className="pointer-events-auto absolute top-20 right-4 z-20 flex h-10 items-center justify-end">
              <div
                className={`font-pixel z-8 mr-2 line-clamp-2 max-h-12 overflow-hidden rounded-md bg-white p-2 text-black transition-all duration-300 ease-in-out ${
                  showMoodStatus
                    ? "w-4/5 translate-x-0 opacity-100"
                    : "w-0 translate-x-full overflow-hidden opacity-0"
                }`}
              >
                <div className="text-left text-[0.65rem]">
                  {pet.moodLogs[0]?.status}
                </div>
              </div>

              <button
                onClick={() => setShowMoodStatus(!showMoodStatus)}
                className="z-9 flex h-10 w-10 items-center justify-center rounded-md bg-white text-xl shadow-lg transition-transform duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Toggle mood status"
              >
                <Image
                  src={getMoodEmoji(pet.moodLogs[0]?.mood || "")}
                  alt="Mood Emoji"
                  width={32}
                  height={32}
                />
              </button>
            </div>
          )}

        {/* Dialogue Box */}
        <AnimatePresence>
          {pet &&
            pet.moodLogs &&
            pet.moodLogs.length > 0 &&
            pet.moodLogs[0]?.dialogue && (
              <motion.div
                key={currentDialogue}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute bottom-8 left-1/2 z-20 mx-auto flex h-auto min-h-10 w-11/12 -translate-x-1/2 items-center rounded-sm border-black bg-white p-2 px-4"
              >
                <TypewriterText text={currentDialogue} speed={30} />
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      <CreatePetModal
        isOpen={showNewPetModal}
        onClose={() => setShowNewPetModal(false)}
      />
    </div>
  );
};

export default PetWrapper;
