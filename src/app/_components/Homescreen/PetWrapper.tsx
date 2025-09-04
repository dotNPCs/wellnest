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

// Typewriter component with blinking cursor
const TypewriterText = ({
  text,
  speed = 50,
}: {
  text: string;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    setShowCursor(true);

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div className="font-pixel text-left text-xs text-black">
      {displayedText}
      <motion.span
        animate={{ opacity: showCursor ? 1 : 0 }}
        transition={{ duration: 0 }}
        className="ml-1 inline-block h-4 w-[0.1rem] bg-black"
      />
    </div>
  );
};

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
      console.log("Pet created successfully!");
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
      console.log("No pet found, auto-creating...");
      hasTriedCreateRef.current = true; // Mark as attempted
      createPetMutation.mutate();
      userCheckInToAppMutation.mutate();
    }
  }, [isLoading, pet, createPetMutation]);

  useEffect(() => {
    console.log("Pet data updated:", pet ? "Pet found" : "No pet found");
    console.log("Pet data:", pet);
  }, [pet]);

  // Update current dialogue when pet data changes
  useEffect(() => {
    if (pet?.moodLogs?.[0]?.dialogue) {
      setCurrentDialogue(pet.moodLogs[0].dialogue);
    }
  }, [pet?.moodLogs]);

  // Function to get mood emoji based on status
  const getMoodEmoji = (status: string) => {
    // You can customize this based on your mood status values
    if (status.toLowerCase().includes("happy")) return "😊";
    if (status.toLowerCase().includes("sad")) return "😢";
    if (status.toLowerCase().includes("angry")) return "😠";
    if (status.toLowerCase().includes("excited")) return "🤩";
    if (status.toLowerCase().includes("tired")) return "😴";
    return "😐"; // Default neutral emoji
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
      hour: "numeric", // Changed from '2-digit' to 'numeric'
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative flex h-[60vh] w-full flex-col items-center justify-center bg-green-500 text-center text-white">
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

      {pet && (
        <div className="font-pixel fixed top-10 left-1/2 w-1/2 -translate-x-1/2 font-bold whitespace-nowrap text-white text-shadow-sm">
          <p>
            DAY {getDaysSinceCreation(pet.adoptedAt)} | {getCurrentTime()}{" "}
          </p>
        </div>
      )}

      {pet &&
        pet.moodLogs &&
        pet.moodLogs.length > 0 &&
        pet.moodLogs[0]?.status && (
          <div className="absolute top-20 right-4 z-50 flex h-10 items-center justify-end">
            {/* Status box that expands to the left */}
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

            {/* Emoji button */}
            <button
              onClick={() => setShowMoodStatus(!showMoodStatus)}
              className="z-9 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-lg transition-transform duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Toggle mood status"
            >
              {getMoodEmoji(pet.moodLogs[0]?.status)}
            </button>
          </div>
        )}

      <AnimatePresence>
        {pet &&
          pet.moodLogs &&
          pet.moodLogs.length > 0 &&
          pet.moodLogs[0]?.dialogue && (
            <motion.div
              key={currentDialogue} // Key ensures re-animation when dialogue changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-8 left-1/2 z-50 mx-auto flex h-auto min-h-10 w-11/12 -translate-x-1/2 items-center rounded-sm border-black bg-white p-2 px-4"
            >
              <TypewriterText text={currentDialogue} speed={30} />
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default PetWrapper;
