import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MealType } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Meal configuration
export const MEAL_CONFIG = {
  [MealType.BREAKFAST]: {
    emoji: "🍳",
    label: "Breakfast",
    timeRange: { start: 5, end: 11 }, // 5 AM - 11 AM
  },
  [MealType.LUNCH]: {
    emoji: "🥗",
    label: "Lunch",
    timeRange: { start: 11, end: 16 }, // 11 AM - 4 PM
  },
  [MealType.DINNER]: {
    emoji: "🍽️",
    label: "Dinner",
    timeRange: { start: 16, end: 23 }, // 4 PM - 11 PM
  },
};

// Helper function to determine current meal based on time
export const getCurrentMealType = (): MealType => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return MealType.BREAKFAST;
  if (hour >= 11 && hour < 16) return MealType.LUNCH;
  return MealType.DINNER;
};

// Helper function to get next pending meal
export const getNextPendingMeal = (todayStatus: {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}): MealType | null => {
  const currentHour = new Date().getHours();

  // Check in order of time priority
  if (!todayStatus.breakfast && currentHour >= 5) return MealType.BREAKFAST;
  if (!todayStatus.lunch && currentHour >= 11) return MealType.LUNCH;
  if (!todayStatus.dinner && currentHour >= 16) return MealType.DINNER;

  return null;
};
