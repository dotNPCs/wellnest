"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Track mood states for each day
  const [moodStates, setMoodStates] = useState<{ [key: string]: number }>({});
  // Track diary entries - now storing arrays of entries per day
  const [diaryEntries, setDiaryEntries] = useState<{ [key: string]: DiaryEntry[] }>({});
  const [showDiaryInput, setShowDiaryInput] = useState(false);
  const [currentDiaryText, setCurrentDiaryText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);

  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😠", label: "Angry" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😎", label: "Cool" },
    { emoji: "😰", label: "Anxious" }
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
      return date.toLocaleDateString('en', { weekday: 'short' });
    }
    if (format === "dd") {
      return date.getDate().toString().padStart(2, '0');
    }
    if (format === "MMM dd") {
      return date.toLocaleDateString('en', { month: 'short', day: '2-digit' });
    }
    return '';
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
      timestamp: new Date()
    };

    setDiaryEntries((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEntry]
    }));

    // Set the mood for today if one was selected
    if (selectedMoodIndex !== null) {
      setMoodStates((prev) => ({
        ...prev,
        [dateKey]: selectedMoodIndex
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

  const getAllEntriesSorted = (): { dateKey: string; entries: DiaryEntry[] }[] => {
    return Object.entries(diaryEntries)
      .filter(([_, entries]) => entries.length > 0)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, entries]) => ({ dateKey, entries }));
  };

  const days = getDaysInWeek();
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return (
    <div className="rounded-xl min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-yellow-50">
      <div className="w-full p-2 flex flex-col items-center">
        {/* Navigation - Compact for mobile */}
        <div className="flex justify-between items-center mb-3 w-full px-2">
          <button
            onClick={prevWeek}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="font-semibold text-sm text-purple-800">
            {formatDate(currentWeekStart, "MMM dd")} - {formatDate(weekEndDate, "MMM dd")}
          </div>

          <button
            onClick={nextWeek}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Today's Mood Display */}
        {(() => {
          const today = new Date();
          const todayKey = getDateKey(today);
          const todayMood = moodStates[todayKey];

          if (todayMood !== undefined && moods[todayMood]) {
            return (
              <div className="w-full px-2 mb-3">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg shadow-sm p-3 flex items-center justify-between border-2 border-orange-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-700 font-medium">Today's vibe:</span>
                    <span className="text-2xl animate-bounce">{moods[todayMood].emoji}</span>
                    <span className="text-sm font-bold text-orange-600">{moods[todayMood].label}</span>
                  </div>
                  <button
                    onClick={() => openDiaryInput(today)}
                    className="text-xs bg-gradient-to-r from-orange-400 to-pink-400 text-white px-3 py-1 rounded-full hover:shadow-md hover:scale-105 transition-all font-medium"
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
            {days.map(day => {
              const today = isToday(day);
              const dayKey = getDateKey(day);
              const moodIndex = moodStates[dayKey];
              const dayEntries = getEntriesForDay(day);
              const hasEntries = dayEntries.length > 0;

              return (
                <div key={day.toString()} className="flex flex-col items-center">
                  {/* Day Card - Smaller for mobile */}
                  <div
                    className={`w-full p-1 rounded-lg text-center shadow-sm transition-transform 
                      ${today ? "ring-2 ring-purple-400 bg-gradient-to-b from-purple-100 to-pink-100" : "bg-white"}  
                      hover:scale-105 hover:shadow-md`}
                  >
                    <div className="text-xs font-medium text-purple-600">
                      {formatDate(day, "EEE").substring(0, 3)}
                    </div>
                    <div className="text-sm font-bold text-purple-800">
                      {formatDate(day, "dd")}
                    </div>
                  </div>

                  {/* Mood/Action Button - Smaller for mobile */}
                  <div className="mt-2 relative">
                    {today ? (
                      <>
                        {moodStates[dayKey] !== undefined ? (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 border-2 border-orange-300 flex items-center justify-center text-base shadow-md">
                            {moods[moodStates[dayKey]]?.emoji}
                          </div>
                        ) : (
                          <button
                            onClick={() => openDiaryInput(day)}
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-white text-lg font-bold hover:from-green-500 hover:to-emerald-500 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-md flex items-center justify-center"
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
                          <div className="w-10 h-10 rounded-full border-2 bg-gradient-to-b from-white to-purple-50 border-purple-200 flex items-center justify-center text-base shadow-sm">
                            {moods[moodIndex ?? 0]?.emoji ?? "😐"}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100">
                          </div>
                        );
                      })()
                    )}

                    {/* Entry count indicator */}
                    {hasEntries && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-white to-purple-50 rounded-2xl p-4 w-full max-w-sm border-2 border-purple-200 shadow-xl">
              <h3 className="text-base font-bold mb-1 text-purple-700">
                Add Entry - {selectedDate.toLocaleDateString('en', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
              <p className="text-xs text-purple-500 mb-3">
                {formatTime(new Date())}
              </p>

              {/* Mood Selection */}
              <div className="mb-3">
                <p className="text-sm text-purple-600 font-medium mb-2">How are you feeling?</p>
                <div className="grid grid-cols-6 gap-2">
                  {moods.map((mood, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMoodIndex(index)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedMoodIndex === index 
                          ? 'bg-gradient-to-r from-yellow-200 to-orange-200 ring-2 ring-orange-400 scale-110 shadow-md' 
                          : 'bg-purple-50 hover:bg-purple-100'
                      }`}
                    >
                      <div className="text-2xl">{mood.emoji}</div>
                      <div className="text-xs mt-1 font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show existing entries for this day */}
              {getEntriesForDay(selectedDate).length > 0 && (
                <div className="mb-3 max-h-32 overflow-y-auto border-t-2 border-purple-200 pt-2">
                  <p className="text-xs text-purple-600 mb-1 font-medium">Today's entries:</p>
                  {getEntriesForDay(selectedDate).map((entry) => (
                    <div key={entry.id} className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded mb-1">
                      <span className="font-bold text-purple-700">{formatTime(entry.timestamp)}</span>
                      <span className="text-purple-600 ml-2">{entry.text.substring(0, 50)}{entry.text.length > 50 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={currentDiaryText}
                onChange={(e) => setCurrentDiaryText(e.target.value)}
                placeholder="How was your day? ✨"
                className="w-full h-24 p-2 text-sm border-2 border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addDiaryEntry}
                  className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-2 px-3 text-sm rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-bold shadow-md"
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
                  className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 py-2 px-3 text-sm rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all font-bold"
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
            <h3 className="text-lg font-bold mb-3 text-purple-700">Your Journey 🌟</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getAllEntriesSorted().map(({ dateKey, entries }) => {
                const entryDate = new Date(dateKey);
                return (
                  <div key={dateKey} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-100">
                    <div className="bg-gradient-to-r from-purple-200 to-pink-200 px-3 py-2">
                      <div className="text-sm font-bold text-purple-700">
                        {entryDate.toLocaleDateString('en', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {entries
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map((entry) => (
                          <div key={entry.id} className="border-l-4 border-pink-300 pl-3 bg-purple-50 rounded-r">
                            <div className="text-xs text-purple-500 mb-1 font-medium">
                              {formatTime(entry.timestamp)}
                            </div>
                            <div className="text-sm text-purple-700 whitespace-pre-wrap">
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