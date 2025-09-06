/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { api } from "@/trpc/react";
import { MealType } from "@prisma/client";
import { useState, useEffect } from "react";
import MealCheckinModal from "./MealCheckinModal";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, Clock, Utensils, Moon } from "lucide-react";

interface MealCheckinHandlerProps {
  /** Specific meal type to check for. If not provided, will determine based on current time */
  mealType?: MealType;
  /** Whether to auto-show modal for pending meals */
  autoShow?: boolean;
  /** Delay before showing auto modal (in ms) */
  autoShowDelay?: number;
}

// Define meal time windows (24-hour format)
const MEAL_WINDOWS = {
  breakfast: { start: 6, end: 11.5 }, // 6:00 AM - 10:00 AM
  lunch: { start: 11.5, end: 15 }, // 11:30 AM - 2:00 PM
  dinner: { start: 17.5, end: 21.5 }, // 5:30 PM - 8:30 PM
};

// Helper function to get current time as decimal hours (e.g., 13:30 = 13.5)
const getCurrentTimeHours = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
};

// Helper function to determine what should be shown based on time and completion status
// Helper function to determine what should be shown based on time and completion status
// Helper function to determine what should be shown based on time and completion status
const getCurrentActiveMeal = (
  todayStatus: any,
): {
  mealType: MealType | null;
  isCompleted: boolean;
  isActionable: boolean;
  displayMode: "meal" | "sleep" | "completed_all" | "none";
} => {
  const currentTime = getCurrentTimeHours();
  const completedCount = todayStatus.completedCount ?? 0;

  // If all meals are completed, show completion state
  if (completedCount >= 3) {
    return {
      mealType: null,
      isCompleted: true,
      isActionable: false,
      displayMode: "completed_all",
    };
  }

  // Check if we're in sleep time (12:00 AM - 6:00 AM)
  if (currentTime >= 0 && currentTime < 6) {
    return {
      mealType: null,
      isCompleted: false,
      isActionable: false,
      displayMode: "sleep",
    };
  }

  // Determine which meal to show based on current time
  let targetMeal: MealType | null = null;
  let isInActiveWindow = false;

  // First, check if we're currently in an active meal window
  if (
    currentTime >= MEAL_WINDOWS.breakfast.start &&
    currentTime <= MEAL_WINDOWS.breakfast.end
  ) {
    targetMeal = MealType.BREAKFAST;
    isInActiveWindow = true;
  } else if (
    currentTime >= MEAL_WINDOWS.lunch.start &&
    currentTime <= MEAL_WINDOWS.lunch.end
  ) {
    targetMeal = MealType.LUNCH;
    isInActiveWindow = true;
  } else if (
    currentTime >= MEAL_WINDOWS.dinner.start &&
    currentTime <= MEAL_WINDOWS.dinner.end
  ) {
    targetMeal = MealType.DINNER;
    isInActiveWindow = true;
  } else {
    // We're between meal windows - show the next uncompleted meal
    return {
      mealType: null,
      isCompleted: false,
      isActionable: false,
      displayMode: "none",
    };
  }

  if (!targetMeal) {
    return {
      mealType: null,
      isCompleted: false,
      isActionable: false,
      displayMode: "sleep",
    };
  }

  const mealKey = targetMeal.toLowerCase() as keyof typeof todayStatus;
  const isCompleted = todayStatus[mealKey] as boolean;

  // Determine if the meal is actionable
  // A meal is actionable if:
  // 1. It's not completed, AND
  // 2. We're currently in its window OR its window has passed (for late logging)
  const mealWindow = MEAL_WINDOWS[mealKey as keyof typeof MEAL_WINDOWS];
  const isActionable =
    !isCompleted && (isInActiveWindow || currentTime > mealWindow.end);

  return {
    mealType: targetMeal,
    isCompleted,
    isActionable,
    displayMode: "meal",
  };
};

// Helper function to get meal display info
const getMealDisplayInfo = (
  mealType: MealType,
  isCompleted: boolean = false,
  isActionable: boolean = true,
) => {
  const mealInfo = {
    [MealType.BREAKFAST]: {
      emoji: "🌅",
      icon: "☕",
      question: isCompleted
        ? "Breakfast logged!"
        : isActionable
          ? "Ready for breakfast?"
          : "Breakfast time passed",
      subtitle: isCompleted
        ? "Great start to your day!"
        : isActionable
          ? "Start your day right"
          : "Time window: 6:00 AM - 11:30 AM",
      time: "6:00 AM - 11:30 AM",
      buttonBg:
        "bg-gradient-to-r from-[#d7a43f] to-[#e5b555] hover:from-[#c4932e] hover:to-[#d7a43f] shadow-lg shadow-[#d7a43f]/20",
      completedBg: "bg-gradient-to-br from-[#6a5a43] to-[#7a6a53]",
      missedBg: "bg-gradient-to-br from-gray-400 to-gray-500",
      accentColor: "#d7a43f",
    },
    [MealType.LUNCH]: {
      emoji: "☀️",
      icon: "🥙",
      question: isCompleted
        ? "Lunch logged!"
        : isActionable
          ? "Time for lunch?"
          : "Lunch time passed",
      subtitle: isCompleted
        ? "Keep the momentum going!"
        : isActionable
          ? "Fuel your afternoon"
          : "Time window: 11:30 AM - 3:00 PM",
      time: "11:30 AM - 3:00 PM",
      buttonBg:
        "bg-gradient-to-r from-[#6a5a43] to-[#7a6a53] hover:from-[#5a4a33] hover:to-[#6a5a43] shadow-lg shadow-[#6a5a43]/20",
      completedBg: "bg-gradient-to-br from-[#6a5a43] to-[#7a6a53]",
      missedBg: "bg-gradient-to-br from-gray-400 to-gray-500",
      accentColor: "#6a5a43",
    },
    [MealType.DINNER]: {
      emoji: "🌙",
      icon: "🍽️",
      question: isCompleted
        ? "Dinner logged!"
        : isActionable
          ? "Ready for dinner?"
          : "Dinner time passed",
      subtitle: isCompleted
        ? "Perfect end to your day!"
        : isActionable
          ? "Wind down with a good meal"
          : "Time window: 5:30 PM - 9:30 PM",
      time: "5:30 PM - 9:30 PM",
      buttonBg:
        "bg-gradient-to-r from-[#402e1a] to-[#503e2a] hover:from-[#301e0a] hover:to-[#402e1a] shadow-lg shadow-[#402e1a]/20",
      completedBg: "bg-gradient-to-br from-[#6a5a43] to-[#7a6a53]",
      missedBg: "bg-gradient-to-br from-gray-400 to-gray-500",
      accentColor: "#402e1a",
    },
  };

  return mealInfo[mealType];
};

// Sleep time display component
const SleepDisplay = () => {
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 shadow-xl"
    >
      {/* Background stars */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-8 h-1 w-1 animate-pulse rounded-full bg-white" />
        <div
          className="absolute top-8 right-12 h-1 w-1 animate-pulse rounded-full bg-white"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-12 left-16 h-1 w-1 animate-pulse rounded-full bg-white"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-16 right-6 h-1 w-1 animate-pulse rounded-full bg-white"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="relative p-6 text-center">
        <motion.div animate={pulseAnimation} className="mb-4 text-4xl">
          🌙
        </motion.div>

        <h3 className="mb-2 text-xl font-bold text-white">Sleep Time</h3>
        <p className="mb-4 text-sm text-indigo-200">
          Rest well! Meal tracking resumes at 6:00 AM
        </p>

        <div className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-indigo-200">
          <Moon className="h-4 w-4" />
          <span>12:00 AM - 6:00 AM</span>
        </div>
      </div>
    </motion.div>
  );
};

const MealCheckinHandler: React.FC<MealCheckinHandlerProps> = ({
  mealType,
  autoShow = false,
  autoShowDelay = 1000,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  const [isMealCompleted, setIsMealCompleted] = useState(false);
  const [isActionable, setIsActionable] = useState(false);
  const [displayMode, setDisplayMode] = useState<
    "meal" | "sleep" | "completed_all" | "none"
  >("meal");

  // Query to check today's status
  const { data: todayStatus, refetch } = api.checkin.getTodayStatus.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: 60000, // Refetch every minute to stay current
    },
  );

  // Update active meal type based on time and completion status
  useEffect(() => {
    if (todayStatus) {
      if (mealType) {
        // If specific meal type is provided, use it
        const mealKey = mealType.toLowerCase() as keyof typeof todayStatus;
        const isCompleted = todayStatus[mealKey] as boolean;
        const currentTime = getCurrentTimeHours();
        const mealWindow = MEAL_WINDOWS[mealKey as keyof typeof MEAL_WINDOWS];
        const isInWindow =
          currentTime >= mealWindow.start && currentTime <= mealWindow.end;
        const canStillLog =
          !isCompleted && (isInWindow || currentTime > mealWindow.end);

        setActiveMealType(mealType);
        setIsMealCompleted(isCompleted);
        setIsActionable(canStillLog);
        setDisplayMode("meal");
      } else {
        // Otherwise, determine automatically based on time and status
        const currentActive = getCurrentActiveMeal(todayStatus);
        setActiveMealType(currentActive.mealType);
        setIsMealCompleted(currentActive.isCompleted);
        setIsActionable(currentActive.isActionable);
        setDisplayMode(currentActive.displayMode);
      }
    }
  }, [todayStatus, mealType]);

  // Auto-show modal logic (only for actionable meals)
  useEffect(() => {
    if (
      todayStatus &&
      activeMealType &&
      !hasChecked &&
      autoShow &&
      isActionable &&
      !isMealCompleted
    ) {
      setHasChecked(true);

      const timer = setTimeout(() => {
        setShowModal(true);
      }, autoShowDelay);

      return () => clearTimeout(timer);
    }
  }, [
    todayStatus,
    hasChecked,
    autoShow,
    autoShowDelay,
    activeMealType,
    isActionable,
    isMealCompleted,
  ]);

  // Reset hasChecked when the active meal changes
  useEffect(() => {
    setHasChecked(false);
  }, [activeMealType]);

  const handleSuccess = async () => {
    await refetch();
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const openMealModal = () => {
    if (activeMealType && isActionable && !isMealCompleted) {
      setShowModal(true);
    }
  };

  // Animation variants for Framer Motion
  const bounceVariants = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      y: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 300,
        duration: 0.6,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  };

  // Don't render anything if no data
  if (!todayStatus || displayMode === "none") {
    return null;
  }

  // Handle sleep time
  if (displayMode === "sleep") {
    return <SleepDisplay />;
  }

  // Handle all meals completed
  if (displayMode === "completed_all") {
    const completedCount = todayStatus.completedCount || 0;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="completed"
          variants={bounceVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#e1db92] via-[#e8e2a0] to-[#d7a43f]/20 p-6 text-center shadow-xl"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-[#d7a43f]" />
            <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-[#6a5a43]" />
          </div>

          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative mb-3 text-4xl"
          >
            🏆
          </motion.div>
          <h3 className="mb-2 text-xl font-bold text-[#402e1a]">
            Perfect Day Complete!
          </h3>
          <p className="mb-4 text-sm font-medium text-[#6a5a43]">
            All 3 meals tracked successfully
          </p>

          {/* Meal badges */}
          <div className="mb-4 flex justify-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#6a5a43] shadow-md"
            >
              <Check className="h-3 w-3" />
              Breakfast
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#6a5a43] shadow-md"
            >
              <Check className="h-3 w-3" />
              Lunch
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#6a5a43] shadow-md"
            >
              <Check className="h-3 w-3" />
              Dinner
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="mb-2 flex justify-between text-xs font-medium text-[#6a5a43]">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Daily Goal
              </span>
              <span className="font-bold">3/3</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/50 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#d7a43f] to-[#6a5a43]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Handle regular meal display
  if (!activeMealType) {
    return null;
  }

  const mealDisplay = getMealDisplayInfo(
    activeMealType,
    isMealCompleted,
    isActionable,
  );
  const completedCount = todayStatus.completedCount || 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeMealType}
        variants={bounceVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Current meal prompt */}
        <div
          className={`relative mb-6 overflow-hidden rounded-2xl ${
            isMealCompleted
              ? "bg-gradient-to-br from-[#e1db92] to-[#e8e2a0] shadow-lg"
              : isActionable
                ? "bg-gradient-to-br from-white via-[#fdfcf8] to-[#e1db92]/30 shadow-xl"
                : "bg-gradient-to-br from-gray-100 to-gray-200 shadow-md"
          }`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[#d7a43f]" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#6a5a43]" />
          </div>

          <div className="relative p-4 sm:p-3">
            {/* Header with emoji and time */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={
                    isActionable && !isMealCompleted ? pulseAnimation : {}
                  }
                  className="text-2xl"
                >
                  {mealDisplay.emoji}
                </motion.div>
                <div>
                  <h3
                    className={`text-lg font-bold ${!isActionable && !isMealCompleted ? "text-gray-600" : "text-[#402e1a]"}`}
                  >
                    {mealDisplay.question}
                  </h3>
                  <p
                    className={`mt-0.5 text-xs ${!isActionable && !isMealCompleted ? "text-gray-500" : "text-[#6a5a43]"}`}
                  >
                    {mealDisplay.subtitle}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isActionable
                    ? "bg-[#e1db92]/50 text-[#6a5a43]"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Clock className="h-3 w-3" />
                {mealDisplay.time}
              </div>
            </div>

            {/* Action button or completed/missed state */}
            <div className="mb-4">
              {!isMealCompleted && isActionable && (
                <motion.button
                  onClick={openMealModal}
                  className={`group relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${mealDisplay.buttonBg}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                    <Utensils className="h-4 w-4" />
                    Log{" "}
                    {activeMealType.charAt(0) +
                      activeMealType.slice(1).toLowerCase()}
                    <span className="ml-1 text-xl">{mealDisplay.icon}</span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>
              )}

              {isMealCompleted && (
                <motion.div
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-white ${mealDisplay.completedBg} shadow-md`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">
                    {activeMealType.charAt(0) +
                      activeMealType.slice(1).toLowerCase()}{" "}
                    Checked In!
                  </span>
                  <span className="text-xl">{mealDisplay.icon}</span>
                </motion.div>
              )}

              {!isMealCompleted && !isActionable && (
                <motion.div
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-white ${mealDisplay.missedBg} shadow-md`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">
                    {activeMealType.charAt(0) +
                      activeMealType.slice(1).toLowerCase()}{" "}
                    Time Passed
                  </span>
                  <span className="text-xl opacity-50">{mealDisplay.icon}</span>
                </motion.div>
              )}
            </div>

            {/* Progress section */}
            <div className="space-y-3">
              {/* Progress bar */}
              <div>
                <div className="mb-2 flex justify-between text-xs font-medium text-[#6a5a43]">
                  <span>Today&apos;s Progress</span>
                  <span className="font-bold">{completedCount}/3 meals</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e1db92]/30 shadow-inner">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#d7a43f] to-[#6a5a43]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / 3) * 100}%` }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Meal status pills */}
              {completedCount > 0 && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                      todayStatus.breakfast
                        ? "bg-[#6a5a43] text-white shadow-md"
                        : "bg-[#e1db92]/30 text-[#6a5a43]/50"
                    }`}
                  >
                    {todayStatus.breakfast && <Check className="h-3 w-3" />}
                    <span>Breakfast</span>
                  </div>
                  <div
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      todayStatus.lunch
                        ? "bg-[#6a5a43] text-white shadow-md"
                        : "bg-[#e1db92]/30 text-[#6a5a43]/50"
                    }`}
                  >
                    {todayStatus.lunch && <Check className="h-3 w-3" />}
                    <span>Lunch</span>
                  </div>
                  <div
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      todayStatus.dinner
                        ? "bg-[#6a5a43] text-white shadow-md"
                        : "bg-[#e1db92]/30 text-[#6a5a43]/50"
                    }`}
                  >
                    {todayStatus.dinner && <Check className="h-3 w-3" />}
                    <span>Dinner</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Only show modal for actionable, non-completed meals */}
        {!isMealCompleted && isActionable && (
          <MealCheckinModal
            isOpen={showModal}
            onClose={handleClose}
            onSuccess={handleSuccess}
            mealType={activeMealType}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MealCheckinHandler;
