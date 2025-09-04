"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

interface DiaryEntry {
  id: string;
  text: string;
  timestamp: Date;
  mealRatings?: { breakfast: number; lunch: number; dinner: number };
  moodIndex?: number;
}

const WeeklyCalendar = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [displayedWeek, setDisplayedWeek] = useState(currentWeekStart);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [moodStates, setMoodStates] = useState<{ [key: string]: number }>({});

  const [diaryEntries, setDiaryEntries] = useState<{
      [key: string]: DiaryEntry[];
    }>({
      // Sample entries for previous days
      "2025-09-01": [
        {
          id: "1",
          text: "Had a great breakfast today!",
          timestamp: new Date("2025-09-01T08:30"),
          moodIndex: 0, // 😊 Happy
          mealRatings: { breakfast: 3, lunch: 2, dinner: 4 } // random ratings
        },
        {
          id: "2",
          text: "Went for a walk in the evening.",
          timestamp: new Date("2025-09-01T18:00"),
          moodIndex: 2, // 🙂 Content
          mealRatings: { breakfast: 3, lunch: 2, dinner: 4 } // same day, can repeat or vary
        }
      ],
      "2025-09-02": [
        {
          id: "3",
          text: "Feeling stressed at work.",
          timestamp: new Date("2025-09-02T12:00"),
          moodIndex: 4, // 😩 Stressed
          mealRatings: { breakfast: 1, lunch: 2, dinner: 3 } // random
        }
      ]
    });


// Initialize calendar moods from diary entries
useEffect(() => {
  const initialMoodStates: { [key: string]: number } = {};

  Object.entries(diaryEntries).forEach(([dateKey, entries]) => {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry?.moodIndex !== undefined) {
      initialMoodStates[dateKey] = lastEntry.moodIndex;
    }
  });

  setMoodStates(initialMoodStates);
}, []);




  const [showDiaryInput, setShowDiaryInput] = useState(false);
  const [currentDiaryText, setCurrentDiaryText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
      setDisplayedWeek(currentWeekStart);
    }, [currentWeekStart]);

  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "🙂", label: "Content" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😩", label: "Stressed" },
    { emoji: "🙏", label: "Grateful" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😃", label: "Energetic" },
    { emoji: "😴", label: "Tired" }
  ];

  const nextWeek = () => {
      setSwipeDirection(1); // left
      setCurrentWeekStart(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
  };

  const prevWeek = () => {
      setSwipeDirection(-1); // right
      setCurrentWeekStart(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
  };

  const handlers = useSwipeable({
      onSwipedLeft: () => nextWeek(),  // Swipe left → next week
      onSwipedRight: () => prevWeek(), // Swipe right → previous week
      trackMouse: true, // optional, allows swipe with mouse
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
      setCurrentDiaryText(""); // Clear input for new entries
      setSelectedMoodIndex(null);
      setShowDiaryInput(true);
   };

  const addDiaryEntry = () => {
      if (!selectedDate || !isToday(selectedDate) || !currentDiaryText.trim()) return;

      const dateKey = getDateKey(selectedDate);

      // Filter out any suspicious characters
      const sanitizedText = currentDiaryText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();



      const newEntry: DiaryEntry = {
          id: crypto.randomUUID(),
          text: sanitizedText,
          timestamp: new Date(),
          moodIndex: selectedMoodIndex ?? undefined, // 👈 store selected mood
      };


      setDiaryEntries(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEntry],
      }));

      // Set the mood for today if one was selected
      if (selectedMoodIndex !== null) {
        setMoodStates(prev => ({
          ...prev,
          [dateKey]: selectedMoodIndex,
        }));
      }

      // Reset modal state
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

  const days = getDaysInWeek(displayedWeek);
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const journeyDate = selectedDate || new Date(); // show today if none selected
  const journeyDateKey = getDateKey(journeyDate);
  const journeyEntries = diaryEntries[journeyDateKey] || [];
  const getMealRatingsForDay = (dateKey: string) => {
      const entries = diaryEntries[dateKey];
      if (!entries || entries.length === 0) {
        return { breakfast: 0, lunch: 0, dinner: 0 }; // fallback
      }

      // Take the last entry with mealRatings, or fallback to 0
      const lastWithRatings = [...entries].reverse().find(e => e.mealRatings);
      return lastWithRatings?.mealRatings ?? { breakfast: 0, lunch: 0, dinner: 0 };
  };



  return (
    <div className="min-h-screen rounded-xl">
      <div className="flex w-full flex-col items-center p-2">
        {/* Navigation - Compact for mobile */}
        <div className="mb-3 flex w-full items-center justify-between px-2">
          <button
            onClick={prevWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
            style={{ backgroundColor: '#A5B68D' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-semibold" style={{ color: '#5A6B4D' }}>
            {formatDate(currentWeekStart, "MMM dd")} -{" "}
            {formatDate(weekEndDate, "MMM dd")}
          </div>

          <button
            onClick={nextWeek}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
            style={{ backgroundColor: '#A5B68D' }}
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
                <div className="flex items-center justify-between rounded-lg p-3 shadow-sm"
                     style={{ backgroundColor: '#FCFAEE', border: '2px solid #DA835950' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: '#DA8359' }}>
                      Today's vibe:
                    </span>
                    <span className="animate-bounce text-2xl">
                      {moods[todayMood].emoji}
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#C17349' }}>
                      {moods[todayMood].label}
                    </span>
                  </div>
                  <button
                    onClick={() => openDiaryInput(today)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                    style={{ backgroundColor: '#DA8359' }}
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
        {/* Days Grid - Swipe + Smooth Animation */}
        <AnimatePresence mode="wait">
          <motion.div
              key={displayedWeek.toDateString()} // use displayedWeek instead of currentWeekStart
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
                const moodIndex = moodStates[dayKey];
                const dayEntries = getEntriesForDay(day);
                const hasEntries = dayEntries.length > 0;

                return (
                  <div
                    key={day.toString()}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setSelectedDate(day); // update "Your Journey" view
                    }}
 // <--- make it clickable
                  >
                    {/* Day Card */}
                    <div
                      className={`w-full rounded-lg p-1 text-center shadow-sm transition-transform hover:scale-105 hover:shadow-md`}
                      style={
                        today
                          ? { backgroundColor: "#F4DCC9", boxShadow: "0 0 0 2px #DA8359" }
                          : { backgroundColor: "white" }
                      }
                    >
                      <div className="text-xs font-medium" style={{ color: "#5A6B4D" }}>
                        {formatDate(day, "EEE").substring(0, 3)}
                      </div>
                      <div className="text-sm font-bold" style={{ color: "#5A6B4D" }}>
                        {formatDate(day, "dd")}
                      </div>
                    </div>

                    {/* Mood / Action Button */}
                    <div className="relative mt-2">
                      {today ? (
                        <>
                          {moodStates[dayKey] !== undefined ? (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-base shadow-md"
                              style={{
                                backgroundColor: "#F4DCC9",
                                border: "2px solid #DA8359",
                              }}
                            >
                              {moods[moodStates[dayKey]]?.emoji}
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
                              {moods[moodIndex ?? 0]?.emoji ?? "😐"}
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
            <div className="w-full max-w-sm rounded-2xl p-4 shadow-xl"
                 style={{ backgroundColor: '#FCFAEE', border: '2px solid #A5B68D50' }}>
              <h3 className="mb-1 text-base font-bold" style={{ color: '#5A6B4D' }}>
                Add Entry -{" "}
                {selectedDate.toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <p className="mb-3 text-xs" style={{ color: '#5A6B4D', opacity: 0.7 }}>
                {formatTime(new Date())}
              </p>

              {/* Mood Selection */}
              <div className="mb-3">
                <p className="mb-2 text-sm font-medium" style={{ color: '#5A6B4D' }}>
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
                      style={selectedMoodIndex === index ?
                        { backgroundColor: '#F4DCC9', boxShadow: '0 0 0 2px #DA8359' } :
                        { backgroundColor: 'white' }
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
                  <div className="mb-3 max-h-32 overflow-y-auto pt-2" style={{ borderTop: '2px solid #A5B68D50' }}>
                    <p className="mb-1 text-xs font-medium" style={{ color: '#5A6B4D' }}>
                      Today's entries:
                    </p>
                    {getEntriesForDay(selectedDate).map((entry) => (
                      <div key={entry.id} className="mb-1 rounded bg-white p-2 text-xs">
                        <span className="font-bold" style={{ color: '#5A6B4D' }}>
                          {formatTime(entry.timestamp)}
                        </span>
                        <span className="ml-2" style={{ color: '#5A6B4D', opacity: 0.8 }}>
                          {entry.text.substring(0, 50)}
                          {entry.text.length > 50 ? "..." : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}


              <textarea
                  value={currentDiaryText}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit input length to 500 characters
                    if (value.length <= 500) {
                      setCurrentDiaryText(value);
                    }
                  }}
                  placeholder="How was your day? ✨"
                  className="h-24 w-full resize-none rounded-lg bg-white p-2 text-sm focus:outline-none"
                  style={{ border: '2px solid #A5B68D50' }}
                  autoFocus
              />


              <div className="mt-3 flex gap-2">
                <button
                  onClick={addDiaryEntry}
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-md transition-all hover:opacity-90"
                  style={{ backgroundColor: '#A5B68D' }}
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
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#DA8359' }}
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
              <h3 className="mb-3 text-lg font-bold" style={{ color: '#5A6B4D' }}>
                Your Journey 🌟 - {journeyDate.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
              </h3>

                {/* Daily Meal Ratings */}
                {journeyEntries.length > 0 && (
                  (() => {
                    const ratings = getMealRatingsForDay(journeyDateKey);

                    const mealLabels: { [key in keyof typeof ratings]: string } = {
                      breakfast: "Breakfast",
                      lunch: "Lunch",
                      dinner: "Dinner",
                    };

                    return (
                      <div className="mb-2 flex flex-col gap-1 text-[10px] text-gray-500">
                        {( ["breakfast", "lunch", "dinner"] as const ).map(meal => {
                          const rating = ratings[meal];
                          const label = mealLabels[meal];

                          return (
                            <div key={meal} className="flex items-center gap-1">
                              <span className="w-12">{label}:</span>
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`${i < rating ? 'opacity-100' : 'opacity-30'}`}
                                >
                                  ⭐
                                </span>

                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}



              <div className="space-y-2">
                {journeyEntries
                  .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map(entry => (
                    <div
                      key={entry.id}
                      className="rounded-r pl-3 pb-2"
                      style={{ borderLeft: '4px solid #DA8359', backgroundColor: '#FCFAEE' }}
                    >
                      <div className="mb-1 flex items-center text-xs font-medium" style={{ color: '#DA8359' }}>
                        {formatTime(entry.timestamp)}
                        {(() => {
                          const mood = typeof entry.moodIndex === "number" ? moods[entry.moodIndex] : undefined;
                          return mood ? <span className="ml-2 text-lg">{mood.emoji}</span> : null;
                        })()}

                      </div>
                      <div className="text-sm whitespace-pre-wrap" style={{ color: '#5A6B4D' }}>
                          {entry.text.split('\n').map((line, idx) => (
                            <span key={idx}>{line}<br /></span>
                          ))}
                      </div>
                    </div>
                  ))
                }
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendar;