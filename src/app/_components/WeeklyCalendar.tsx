"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiaryEntry {
  id: string;
  text: string;
  timestamp: Date;
}

const WeeklyCalendar = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [moodStates, setMoodStates] = useState<{ [key: string]: number }>({});

  const [diaryEntries, setDiaryEntries] = useState<{
    [key: string]: DiaryEntry[];
  }>({});
  const [showDiaryInput, setShowDiaryInput] = useState(false);
  const [currentDiaryText, setCurrentDiaryText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(
    null,
  );

  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😠", label: "Angry" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😎", label: "Cool" },
    { emoji: "😰", label: "Anxious" },
  ];

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const getDaysInWeek = (): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date, format: string): string => {
    if (format === "EEE") {
      return date.toLocaleDateString("en", { weekday: "short" });
    }
    if (format === "dd") {
      return date.getDate().toString().padStart(2, "0");
    }
    if (format === "MMM dd") {
      return date.toLocaleDateString("en", { month: "short", day: "2-digit" });
    }
    return "";
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openDiaryInput = (date: Date) => {
    setSelectedDate(date);
    setShowDiaryInput(true);
  };

  const addDiaryEntry = () => {
    if (!selectedDate || !currentDiaryText.trim()) return;

    const dateKey = getDateKey(selectedDate);
    const newEntry: DiaryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      text: currentDiaryText.trim(),
      timestamp: new Date(),
    };

    setDiaryEntries((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEntry],
    }));

    // Set the mood for today if one was selected
    if (selectedMoodIndex !== null) {
      setMoodStates((prev) => ({
        ...prev,
        [dateKey]: selectedMoodIndex,
      }));
    }

    setCurrentDiaryText("");
    setShowDiaryInput(false);
    setSelectedDate(null);
    setSelectedMoodIndex(null);
  };

  const getEntriesForDay = (date: Date): DiaryEntry[] => {
    const dateKey = getDateKey(date);
    return diaryEntries[dateKey] || [];
  };

  const getAllEntriesSorted = (): {
    dateKey: string;
    entries: DiaryEntry[];
  }[] => {
    return Object.entries(diaryEntries)
      .filter(([_, entries]) => entries.length > 0)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, entries]) => ({ dateKey, entries }));
  };

  const days = getDaysInWeek();
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return (
    <div className="min-h-screen rounded-xl bg-gradient-to-b from-purple-100 via-pink-50 to-yellow-50">
      <div className="flex w-full flex-col items-center p-2">
        {/* Navigation - Compact for mobile */}
        <div className="mb-3 flex w-full items-center justify-between px-2">
          <button
            onClick={prevWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-semibold text-purple-800">
            {formatDate(currentWeekStart, "MMM dd")} -{" "}
            {formatDate(weekEndDate, "MMM dd")}
          </div>

          <button
            onClick={nextWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Today's Mood Display */}
        {(() => {
          const today = new Date();
          const todayKey = getDateKey(today);
          const todayMood = moodStates[todayKey];

          if (todayMood !== undefined && moods[todayMood]) {
            return (
              <div className="mb-3 w-full px-2">
                <div className="flex items-center justify-between rounded-lg border-2 border-orange-200 bg-gradient-to-r from-yellow-100 to-orange-100 p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-700">
                      Today's vibe:
                    </span>
                    <span className="animate-bounce text-2xl">
                      {moods[todayMood].emoji}
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      {moods[todayMood].label}
                    </span>
                  </div>
                  <button
                    onClick={() => openDiaryInput(today)}
                    className="rounded-full bg-gradient-to-r from-orange-400 to-pink-400 px-3 py-1 text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Days Grid - Optimized for iPhone SE width */}
        <div className="w-full px-2">
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const today = isToday(day);
              const dayKey = getDateKey(day);
              const moodIndex = moodStates[dayKey];
              const dayEntries = getEntriesForDay(day);
              const hasEntries = dayEntries.length > 0;

              return (
                <div
                  key={day.toString()}
                  className="flex flex-col items-center"
                >
                  {/* Day Card - Smaller for mobile */}
                  <div
                    className={`w-full rounded-lg p-1 text-center shadow-sm transition-transform ${today ? "bg-gradient-to-b from-purple-100 to-pink-100 ring-2 ring-purple-400" : "bg-white"} hover:scale-105 hover:shadow-md`}
                  >
                    <div className="text-xs font-medium text-purple-600">
                      {formatDate(day, "EEE").substring(0, 3)}
                    </div>
                    <div className="text-sm font-bold text-purple-800">
                      {formatDate(day, "dd")}
                    </div>
                  </div>

                  {/* Mood/Action Button - Smaller for mobile */}
                  <div className="relative mt-2">
                    {today ? (
                      <>
                        {moodStates[dayKey] !== undefined ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-300 bg-gradient-to-r from-yellow-200 to-orange-200 text-base shadow-md">
                            {moods[moodStates[dayKey]]?.emoji}
                          </div>
                        ) : (
                          <button
                            onClick={() => openDiaryInput(day)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-110 hover:from-green-500 hover:to-emerald-500 focus:ring-2 focus:ring-green-300 focus:outline-none"
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-purple-200 bg-gradient-to-b from-white to-purple-50 text-base shadow-sm">
                            {moods[moodIndex ?? 0]?.emoji ?? "😐"}
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100"></div>
                        );
                      })()
                    )}

                    {/* Entry count indicator */}
                    {hasEntries && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-xs font-bold text-white shadow-sm">
                        {dayEntries.length}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diary Input Modal */}
        {showDiaryInput && selectedDate && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-sm rounded-2xl border-2 border-purple-200 bg-gradient-to-b from-white to-purple-50 p-4 shadow-xl">
              <h3 className="mb-1 text-base font-bold text-purple-700">
                Add Entry -{" "}
                {selectedDate.toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <p className="mb-3 text-xs text-purple-500">
                {formatTime(new Date())}
              </p>

              {/* Mood Selection */}
              <div className="mb-3">
                <p className="mb-2 text-sm font-medium text-purple-600">
                  How are you feeling?
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {moods.map((mood, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMoodIndex(index)}
                      className={`rounded-lg p-2 transition-all ${
                        selectedMoodIndex === index
                          ? "scale-110 bg-gradient-to-r from-yellow-200 to-orange-200 shadow-md ring-2 ring-orange-400"
                          : "bg-purple-50 hover:bg-purple-100"
                      }`}
                    >
                      <div className="text-2xl">{mood.emoji}</div>
                      <div className="mt-1 text-xs font-medium">
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show existing entries for this day */}
              {getEntriesForDay(selectedDate).length > 0 && (
                <div className="mb-3 max-h-32 overflow-y-auto border-t-2 border-purple-200 pt-2">
                  <p className="mb-1 text-xs font-medium text-purple-600">
                    Today's entries:
                  </p>
                  {getEntriesForDay(selectedDate).map((entry) => (
                    <div
                      key={entry.id}
                      className="mb-1 rounded bg-gradient-to-r from-purple-50 to-pink-50 p-2 text-xs"
                    >
                      <span className="font-bold text-purple-700">
                        {formatTime(entry.timestamp)}
                      </span>
                      <span className="ml-2 text-purple-600">
                        {entry.text.substring(0, 50)}
                        {entry.text.length > 50 ? "..." : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={currentDiaryText}
                onChange={(e) => setCurrentDiaryText(e.target.value)}
                placeholder="How was your day? ✨"
                className="h-24 w-full resize-none rounded-lg border-2 border-purple-200 bg-white p-2 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-400 focus:outline-none"
                autoFocus
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={addDiaryEntry}
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 px-3 py-2 text-sm font-bold text-white shadow-md transition-all hover:from-purple-500 hover:to-pink-500"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowDiaryInput(false);
                    setCurrentDiaryText("");
                    setSelectedDate(null);
                    setSelectedMoodIndex(null);
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 px-3 py-2 text-sm font-bold text-gray-700 transition-all hover:from-gray-300 hover:to-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diary Entries Display - Mobile optimized */}
        {getAllEntriesSorted().length > 0 && (
          <div className="mt-6 w-full px-2 pb-4">
            <h3 className="mb-3 text-lg font-bold text-purple-700">
              Your Journey 🌟
            </h3>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {getAllEntriesSorted().map(({ dateKey, entries }) => {
                const entryDate = new Date(dateKey);
                return (
                  <div
                    key={dateKey}
                    className="overflow-hidden rounded-xl border-2 border-purple-100 bg-white shadow-md"
                  >
                    <div className="bg-gradient-to-r from-purple-200 to-pink-200 px-3 py-2">
                      <div className="text-sm font-bold text-purple-700">
                        {entryDate.toLocaleDateString("en", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      {entries
                        .sort(
                          (a, b) =>
                            b.timestamp.getTime() - a.timestamp.getTime(),
                        )
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-r border-l-4 border-pink-300 bg-purple-50 pl-3"
                          >
                            <div className="mb-1 text-xs font-medium text-purple-500">
                              {formatTime(entry.timestamp)}
                            </div>
                            <div className="text-sm whitespace-pre-wrap text-purple-700">
                              {entry.text}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
