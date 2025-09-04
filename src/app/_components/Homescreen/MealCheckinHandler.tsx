import {
  MEAL_CONFIG,
  getCurrentMealType,
  getNextPendingMeal,
} from "@/lib/utils";
import { api } from "@/trpc/react";
import { MealType } from "@prisma/client";
import { useState, useEffect } from "react";
import MealCheckinModal from "./MealCheckinModal";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface MealCheckinHandlerProps {
  /** Specific meal type to check for. If not provided, will determine based on current time */
  mealType?: MealType;
  /** Whether to auto-show modal for pending meals */
  autoShow?: boolean;
  /** Delay before showing auto modal (in ms) */
  autoShowDelay?: number;
}

// Helper function to get the current active meal based on time and completion status
const getCurrentActiveMeal = (
  todayStatus: any,
): { mealType: MealType | null; isCompleted: boolean } => {
  const currentMealTime = getCurrentMealType();

  // Always show the current time meal first, whether completed or not
  const currentMealKey =
    currentMealTime.toLowerCase() as keyof typeof todayStatus;
  const isCurrentMealCompleted = todayStatus[currentMealKey] as boolean;

  // If current meal time is still active (not completed), show it as actionable
  if (!isCurrentMealCompleted) {
    return { mealType: currentMealTime, isCompleted: false };
  }

  // If current meal is completed, show it as completed but still visible
  return { mealType: currentMealTime, isCompleted: true };
};

// Helper function to get meal display info
const getMealDisplayInfo = (
  mealType: MealType,
  isCompleted: boolean = false,
) => {
  const mealInfo = {
    [MealType.BREAKFAST]: {
      emoji: isCompleted ? "🍳" : "🍳",
      question: isCompleted ? "Breakfast logged!" : "What's for breakfast?",
      color: "orange",
      completedColor: "green",
    },
    [MealType.LUNCH]: {
      emoji: isCompleted ? "🥗" : "🥗",
      question: isCompleted ? "Lunch logged!" : "What's for lunch?",
      color: "green",
      completedColor: "green",
    },
    [MealType.DINNER]: {
      emoji: isCompleted ? "🍽️" : "🍽️",
      question: isCompleted ? "Dinner logged!" : "What's for dinner?",
      color: "purple",
      completedColor: "green",
    },
  };

  return mealInfo[mealType];
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
        setActiveMealType(mealType);
        setIsMealCompleted(isCompleted);
      } else {
        // Otherwise, determine automatically based on time and status
        const currentActive = getCurrentActiveMeal(todayStatus);
        setActiveMealType(currentActive.mealType);
        setIsMealCompleted(currentActive.isCompleted);
      }
    }
  }, [todayStatus, mealType]);

  // Auto-show modal logic (only for non-completed meals)
  useEffect(() => {
    if (
      todayStatus &&
      activeMealType &&
      !hasChecked &&
      autoShow &&
      !isMealCompleted
    ) {
      setHasChecked(true);

      // Only show modal if the meal is not completed
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
    isMealCompleted,
  ]);

  // Reset hasChecked when the active meal changes
  useEffect(() => {
    setHasChecked(false);
  }, [activeMealType]);

  const handleSuccess = () => {
    // Refetch the status to update the UI
    refetch();
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const openMealModal = () => {
    if (activeMealType && !isMealCompleted) {
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

  // Don't render anything if no active meal
  if (!todayStatus || !activeMealType) {
    return null;
  }

  const mealDisplay = getMealDisplayInfo(activeMealType, isMealCompleted);
  const completedCount = todayStatus.completedCount || 0;

  // If all meals are completed, show completion message
  if (completedCount >= 3) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="completed"
          variants={bounceVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mb-4 rounded-lg bg-green-50 p-4 text-center"
        >
          <div className="mb-2 text-2xl">🎉</div>
          <h3 className="font-medium text-green-800">
            All meals logged for today!
          </h3>
          <p className="mt-1 text-sm text-green-600">
            Great job staying on track
          </p>

          {/* Progress indicator */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-green-600">
              <span>Progress</span>
              <span>3/3</span>
            </div>
            <div className="h-2 w-full rounded-full bg-green-200">
              <motion.div
                className="h-2 rounded-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          className={`mb-4 rounded-lg p-4 ${isMealCompleted ? "bg-green-50" : "bg-gray-50"}`}
        >
          <div className="text-center">
            {!isMealCompleted && (
              <h3
                className={`mb-3 text-lg font-medium ${isMealCompleted ? "text-green-800" : "text-gray-900"}`}
              >
                {mealDisplay.question}
              </h3>
            )}

            {!isMealCompleted && (
              <motion.button
                onClick={openMealModal}
                className={`w-full rounded-lg px-4 py-3 font-medium text-white transition-colors ${mealDisplay.color === "orange" ? "bg-orange-500 hover:bg-orange-600" : ""} ${mealDisplay.color === "green" ? "bg-green-500 hover:bg-green-600" : ""} ${mealDisplay.color === "purple" ? "bg-purple-500 hover:bg-purple-600" : ""} `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Log{" "}
                {activeMealType.charAt(0) +
                  activeMealType.slice(1).toLowerCase()}
              </motion.button>
            )}

            {isMealCompleted && (
              <motion.div
                className="w-full rounded-lg bg-green-100 px-4 py-3 text-green-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="font-medium">
                  {activeMealType.charAt(0) +
                    activeMealType.slice(1).toLowerCase()}{" "}
                  Checked in!
                </span>
              </motion.div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Daily Progress</span>
              <span>{completedCount}/3</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <motion.div
                className="h-2 rounded-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / 3) * 100}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Small status indicators for completed meals */}
          {completedCount > 0 && (
            <motion.div
              className="mt-3 flex justify-center space-x-4 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {todayStatus.breakfast && (
                <span className="flex items-center text-green-600">
                  🍳 <span className="ml-1">Breakfast ✓</span>
                </span>
              )}
              {todayStatus.lunch && (
                <span className="flex items-center text-green-600">
                  🥗 <span className="ml-1">Lunch ✓</span>
                </span>
              )}
              {todayStatus.dinner && (
                <span className="flex items-center text-green-600">
                  🍽️ <span className="ml-1">Dinner ✓</span>
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Only show modal for non-completed meals */}
        {!isMealCompleted && (
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
