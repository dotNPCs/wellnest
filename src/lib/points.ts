import { MealType } from "@prisma/client";

export const HAPPINESS_CONFIG = {
  baseline: 20,
  farmThreshold: 80, // below this = farm
  maxHappiness: 100,
  decayPerDay: 3, // loses 1 happiness per hour of neglect

  actions: {
    streakDay: 5, // every extra day, the happiness gained increases by this amount.
    checkinStreakBonus: 5, // bonus for completing all 3 check-ins in a day
    meditated: 10,
    journal: 10,
    checkin: 2, // just opening the app
  },
} as const;

export const MEAL_SEQUENCE: MealType[] = [
  MealType.BREAKFAST,
  MealType.LUNCH,
  MealType.DINNER,
];

export function getNextMeal(current: MealType): MealType | undefined {
  const index = MEAL_SEQUENCE.indexOf(current);
  return MEAL_SEQUENCE[(index + 1) % MEAL_SEQUENCE.length];
}

export function calculateCurrentHappiness(
  lastHappiness: number,
  lastUpdateAt: Date,
  now: Date = new Date(),
): number {
  const daysElapsed =
    (now.getTime() - lastUpdateAt.getTime()) / (1000 * 60 * 60 * 24);
  const decayAmount = Math.floor(daysElapsed * HAPPINESS_CONFIG.decayPerDay);
  if (decayAmount <= 0) {
  }

  const currentHappiness = Math.max(0, lastHappiness - decayAmount);

  return currentHappiness;
}
