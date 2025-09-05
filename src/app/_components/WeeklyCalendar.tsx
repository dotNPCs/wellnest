"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { type JournalEntry } from "@prisma/client";
import { api } from "@/trpc/react";
import { UserMood, MealType } from "@prisma/client"; // Adjust import path
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfDay,
} from "date-fns";

interface MealRatings {
  breakfast: number;
  lunch: number;
  dinner: number;
}

const WeeklyCalendar = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  });
  const [displayedWeek, setDisplayedWeek] = useState(currentWeekStart);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modal state
  const [showDiaryInput, setShowDiaryInput] = useState(false);
  const [currentDiaryText, setCurrentDiaryText] = useState("");
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(
    null,
  );

  const [isCreatingJournal, setIsCreatingJournal] = useState(false);

  // Calculate week end for queries
  const weekStart = startOfWeek(displayedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(displayedWeek, { weekStartsOn: 1 });

  // tRPC queries
  const { data: journalsByDate = {}, refetch: refetchJournals } =
    api.journal.getJournalsByDateRange.useQuery({
      startDate: weekStart,
      endDate: weekEnd,
    });

  const { data: checkinsByDate = {}, refetch: refetchCheckins } =
    api.journal.getDailyCheckins.useQuery({
      startDate: weekStart,
      endDate: weekEnd,
    });

  const { data: moodStates = {}, refetch: refetchMoods } =
    api.journal.getMoodStates.useQuery({
      startDate: weekStart,
      endDate: weekEnd,
    });

  // Mutations
  const createJournal = api.journal.createJournal.useMutation({
    onMutate: async (newEntry) => {
      setIsCreatingJournal(true);
    },

    onSuccess: () => {
      setIsCreatingJournal(false);
      refetchJournals();
      refetchMoods();
    },
    onSettled: () => {
      setIsCreatingJournal(false);
    },
  });

  const upsertCheckin = api.journal.upsertDailyCheckin.useMutation({
    onSuccess: () => {
      refetchCheckins();
    },
  });

  useEffect(() => {
    setDisplayedWeek(currentWeekStart);
  }, [currentWeekStart]);

  // Mood mapping - you'll need to map your UserMood enum to these
  const moods = [
    { emoji: "😊", label: "Happy", value: "HAPPY" },
    { emoji: "😐", label: "Neutral", value: "NEUTRAL" },
    { emoji: "🙂", label: "Content", value: "CONTENT" },
    { emoji: "🤩", label: "Excited", value: "EXCITED" },
    { emoji: "😩", label: "Stressed", value: "STRESSED" },
    { emoji: "🙏", label: "Grateful", value: "GRATEFUL" },
    { emoji: "😌", label: "Calm", value: "CALM" },
    { emoji: "😰", label: "Anxious", value: "ANXIOUS" },
    { emoji: "😃", label: "Energetic", value: "ENERGETIC" },
    { emoji: "😴", label: "Tired", value: "TIRED" },
  ];

  const nextWeek = () => {
    setSwipeDirection(1);
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const prevWeek = () => {
    setSwipeDirection(-1);
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextWeek(),
    onSwipedRight: () => prevWeek(),
    trackMouse: true,
  });

  const getDaysInWeek = (weekStart: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  };

  const formatDate = (date: Date, formatStr: string): string => {
    if (formatStr === "EEE") {
      return format(date, "EEE");
    }
    if (formatStr === "dd") {
      return format(date, "dd");
    }
    if (formatStr === "MMM dd") {
      return format(date, "MMM dd");
    }
    return "";
  };

  const formatTime = (date: Date): string => {
    return format(date, "h:mm a");
  };

  const getDateKey = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  const openDiaryInput = (date: Date) => {
    setSelectedDate(date);
    setCurrentDiaryText("");
    setSelectedMoodIndex(null);
    setShowDiaryInput(true);
  };

  const addDiaryEntry = async () => {
    if (!selectedDate || !isToday(selectedDate) || !currentDiaryText.trim())
      return;

    const moodValue =
      selectedMoodIndex !== null
        ? (moods[selectedMoodIndex]?.value as UserMood)
        : undefined;

    try {
      await createJournal.mutateAsync({
        content: currentDiaryText.trim(),
        mood: moodValue,
        createdAt: new Date(),
      });

      setCurrentDiaryText("");
      setShowDiaryInput(false);
      setSelectedDate(new Date());
      setSelectedMoodIndex(null);
    } catch (error) {
      console.error("Failed to create journal entry:", error);
    }
  };

  const getEntriesForDay = (date: Date): JournalEntry[] => {
    const dateKey = getDateKey(date);
    return journalsByDate[dateKey] || [];
  };

  const getMealRatingsForDay = (dateKey: string): MealRatings => {
    const dayCheckins = checkinsByDate[dateKey];
    if (!dayCheckins) {
      return { breakfast: 0, lunch: 0, dinner: 0 };
    }

    return {
      breakfast: dayCheckins.breakfast?.rating || 0,
      lunch: dayCheckins.lunch?.rating || 0,
      dinner: dayCheckins.dinner?.rating || 0,
    };
  };

  useEffect(() => {
    console.log("isCreatingJournal changed:", isCreatingJournal);
  }, [isCreatingJournal]);

  useEffect(() => {
    console.log("selectedDate changed:", selectedDate);
  }, [selectedDate]);

  const getMoodIndexFromValue = (moodValue: UserMood): number => {
    const index = moods.findIndex((mood) => mood.value === moodValue);
    return index !== -1 ? index : 0;
  };

  const days = getDaysInWeek(displayedWeek);
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const journeyDate = selectedDate || new Date();
  const journeyDateKey = getDateKey(journeyDate);
  const journeyEntries = journalsByDate[journeyDateKey] || [];

  return (
    <div className="min-h-screen rounded-xl">
      <div className="flex w-full flex-col items-center p-2">
        {/* Navigation */}
        <div className="mb-3 flex w-full items-center justify-between px-2">
          <button
            onClick={prevWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
            style={{ backgroundColor: "#A5B68D" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-semibold" style={{ color: "#5A6B4D" }}>
            {formatDate(currentWeekStart, "MMM dd")} -{" "}
            {formatDate(weekEndDate, "MMM dd")}
          </div>

          <button
            onClick={nextWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
            style={{ backgroundColor: "#A5B68D" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Today's Mood Display */}
        {(() => {
          const today = new Date();
          const todayKey = getDateKey(today);
          const todayMood = moodStates[todayKey];

          if (todayMood) {
            const moodIndex = getMoodIndexFromValue(todayMood);
            return (
              <div className="mb-3 w-full px-2">
                <div
                  className="flex items-center justify-between rounded-lg p-3 shadow-sm"
                  style={{
                    backgroundColor: "#FCFAEE",
                    border: "2px solid #DA835950",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#DA8359" }}
                    >
                      Today's vibe:
                    </span>
                    <span className="animate-bounce text-2xl">
                      {moods[moodIndex]?.emoji}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#C17349" }}
                    >
                      {moods[moodIndex]?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => openDiaryInput(today)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                    style={{ backgroundColor: "#DA8359" }}
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Days Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedWeek.toDateString()}
            initial={{ x: swipeDirection * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -swipeDirection * 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            {...handlers}
            className="w-full px-2"
          >
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const today = isToday(day);
                const dayKey = getDateKey(day);
                const dayMood = moodStates[dayKey];
                const dayEntries = getEntriesForDay(day);
                const hasEntries = dayEntries.length > 0;

                return (
                  <div
                    key={day.toString()}
                    className="flex cursor-pointer flex-col items-center"
                    onClick={() => setSelectedDate(day)}
                  >
                    {/* Day Card */}
                    <div
                      className={`w-full rounded-lg p-1 text-center shadow-sm transition-transform hover:scale-105 hover:shadow-md`}
                      style={
                        today
                          ? {
                              backgroundColor: "#F4DCC9",
                              boxShadow: "0 0 0 2px #DA8359",
                            }
                          : getDateKey(selectedDate) === getDateKey(day)
                            ? {
                                backgroundColor: "#FCFAEE",
                                border: "2px solid #A5B68D50",
                              }
                            : { backgroundColor: "white" }
                      }
                    >
                      <div
                        className="text-xs font-medium"
                        style={{ color: "#5A6B4D" }}
                      >
                        {formatDate(day, "EEE").substring(0, 3)}
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#5A6B4D" }}
                      >
                        {formatDate(day, "dd")}
                      </div>
                    </div>

                    {/* Mood / Action Button */}
                    <div className="relative mt-2">
                      {today ? (
                        <>
                          {dayMood ? (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-base shadow-md"
                              style={{
                                backgroundColor: "#F4DCC9",
                                border: "2px solid #DA8359",
                              }}
                            >
                              {moods[getMoodIndexFromValue(dayMood)]?.emoji}
                            </div>
                          ) : (
                            <button
                              onClick={() => openDiaryInput(day)}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-110 focus:outline-none"
                              style={{ backgroundColor: "#A5B68D" }}
                            >
                              +
                            </button>
                          )}
                        </>
                      ) : (
                        (() => {
                          const now = new Date();
                          const isPast = day < now && !today;
                          return isPast ? (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-base shadow-sm"
                              style={{
                                backgroundColor: "#FCFAEE",
                                border: "2px solid #A5B68D50",
                              }}
                            >
                              {dayMood
                                ? moods[getMoodIndexFromValue(dayMood)]?.emoji
                                : "-"}
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full border-2 border-gray-200 bg-gray-50"></div>
                          );
                        })()
                      )}

                      {/* Entry count indicator */}
                      {hasEntries && (
                        <div
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: "#DA8359" }}
                        >
                          {dayEntries.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Diary Input Modal */}
        {showDiaryInput && selectedDate && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div
              className="w-full max-w-sm rounded-2xl p-4 shadow-xl"
              style={{
                backgroundColor: "#FCFAEE",
                border: "2px solid #A5B68D50",
              }}
            >
              <h3
                className="mb-1 text-base font-bold"
                style={{ color: "#5A6B4D" }}
              >
                Add Entry -{" "}
                {selectedDate.toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <p
                className="mb-3 text-xs"
                style={{ color: "#5A6B4D", opacity: 0.7 }}
              >
                {formatTime(new Date())}
              </p>

              {/* Mood Selection */}
              <div className="mb-3">
                <p
                  className="mb-2 text-sm font-medium"
                  style={{ color: "#5A6B4D" }}
                >
                  How are you feeling?
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {moods.map((mood, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMoodIndex(index)}
                      className={`rounded-lg p-2 transition-all ${
                        selectedMoodIndex === index
                          ? "scale-110 shadow-md"
                          : "hover:opacity-80"
                      }`}
                      style={
                        selectedMoodIndex === index
                          ? {
                              backgroundColor: "#F4DCC9",
                              boxShadow: "0 0 0 2px #DA8359",
                            }
                          : { backgroundColor: "white" }
                      }
                    >
                      <div className="text-2xl">{mood.emoji}</div>
                      <div className="mt-1 text-[8px] font-medium">
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show existing entries for this day */}
              {selectedDate && getEntriesForDay(selectedDate).length > 0 && (
                <div
                  className="mb-3 max-h-32 overflow-y-auto pt-2"
                  style={{ borderTop: "2px solid #A5B68D50" }}
                >
                  <p
                    className="mb-1 text-xs font-medium"
                    style={{ color: "#5A6B4D" }}
                  >
                    Today's entries:
                  </p>
                  {getEntriesForDay(selectedDate).map((entry) => (
                    <div
                      key={entry.id}
                      className="mb-1 rounded bg-white p-2 text-xs"
                    >
                      <span className="font-bold" style={{ color: "#5A6B4D" }}>
                        {formatTime(entry.createdAt)}
                      </span>
                      <span
                        className="ml-2"
                        style={{ color: "#5A6B4D", opacity: 0.8 }}
                      >
                        {entry.content.substring(0, 50)}
                        {entry.content.length > 50 ? "..." : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={currentDiaryText}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setCurrentDiaryText(value);
                  }
                }}
                placeholder="How was your day? ✨"
                className="h-24 w-full resize-none rounded-lg bg-white p-2 text-sm focus:outline-none"
                style={{ border: "2px solid #A5B68D50" }}
                autoFocus
              />

              <div className="mt-3 flex gap-2">
                <button
                  onClick={addDiaryEntry}
                  disabled={isCreatingJournal}
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#A5B68D" }}
                >
                  {isCreatingJournal ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowDiaryInput(false);
                    setCurrentDiaryText("");
                    setSelectedDate(new Date());
                    setSelectedMoodIndex(null);
                  }}
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#DA8359" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diary Entries Display */}
        {journeyEntries.length > 0 && (
          <div className="mt-6 w-full px-2 pb-4">
            <h3 className="mb-3 text-lg font-bold" style={{ color: "#5A6B4D" }}>
              Your Journey 🌟 -{" "}
              {journeyDate.toLocaleDateString("en", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>

            {/* Daily Meal Ratings */}
            {(() => {
              const ratings = getMealRatingsForDay(journeyDateKey);
              const hasRatings =
                ratings.breakfast > 0 ||
                ratings.lunch > 0 ||
                ratings.dinner > 0;

              if (!hasRatings) return null;

              const mealLabels: { [key in keyof typeof ratings]: string } = {
                breakfast: "Breakfast",
                lunch: "Lunch",
                dinner: "Dinner",
              };

              return (
                <div className="mb-2 flex flex-col gap-1 text-[10px] text-gray-500">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                    const rating = ratings[meal];
                    const label = mealLabels[meal];

                    if (rating === 0) return null;

                    return (
                      <div key={meal} className="flex items-center gap-1">
                        <span className="w-12">{label}:</span>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`${i < rating ? "opacity-100" : "opacity-30"}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="space-y-2">
              {journeyEntries
                .sort(
                  (a: JournalEntry, b: JournalEntry) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((entry: JournalEntry) => (
                  <div
                    key={entry.id}
                    className="rounded-r pb-2 pl-3"
                    style={{
                      borderLeft: "4px solid #DA8359",
                      backgroundColor: "#FCFAEE",
                    }}
                  >
                    <div
                      className="mb-1 flex items-center text-xs font-medium"
                      style={{ color: "#DA8359" }}
                    >
                      {formatTime(new Date(entry.createdAt))}
                      {entry.mood && (
                        <span className="ml-2 text-lg">
                          {moods[getMoodIndexFromValue(entry.mood)]?.emoji}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: "#5A6B4D" }}
                    >
                      {entry.content
                        .split("\n")
                        .map((line: string, idx: number) => (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {journeyEntries.length === 0 && (
          <div className="mt-6 flex h-40 w-full flex-col items-center justify-center px-2 pb-4 text-center text-sm text-gray-500">
            <p>No journal entries for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
