"use client";

import { useState } from "react";

const WeeklyCalendar = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Track mood states for each day
  const [moodStates, setMoodStates] = useState<{ [key: string]: number }>({});
  // Track diary entries
  const [diaryEntries, setDiaryEntries] = useState<{ [key: string]: string }>({});
  const [showDiaryInput, setShowDiaryInput] = useState(false);
  const [currentDiaryText, setCurrentDiaryText] = useState("");

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
  const getDateKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
};





  const cycleMood = (dayKey: string) => {
    setMoodStates((prev) => {
      const currentMoodIndex = prev[dayKey] || -1;
      const nextMoodIndex = (currentMoodIndex + 1) % moods.length;
      return {
        ...prev,
        [dayKey]: nextMoodIndex
      };
    });
  };

  const addDiaryEntry = () => {
    const today = new Date();
    const todayKey = getDateKey(today);

    if (currentDiaryText.trim()) {
      setDiaryEntries((prev) => ({
        ...prev,
        [todayKey]: currentDiaryText.trim()
      }));
      setCurrentDiaryText("");
      setShowDiaryInput(false);
    }
  };

  const days = getDaysInWeek();
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full p-4 flex flex-col items-center rounded-lg shadow-lg">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4 w-full max-w-3xl">
        <button
          onClick={prevWeek}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow hover:bg-slate-200 transition text-xl"
        >
          ⬅️
        </button>

        <div className="font-semibold text-lg text-slate-700">
          {formatDate(currentWeekStart, "MMM dd")} - {formatDate(weekEndDate, "MMM dd")}
        </div>

        <button
          onClick={nextWeek}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow hover:bg-slate-200 transition text-xl"
        >
          ➡️
        </button>
      </div>

      {/* Days row container */}
      <div className="w-full flex justify-center">
        <div className="flex gap-4 justify-center">
          {days.map(day => {
            const today = isToday(day);
            const dayKey = getDateKey(day);
            const moodIndex = moodStates[dayKey];
            const hasMood = moodIndex !== undefined && moodIndex >= 0;

            return (
              <div key={day.toString()} className="flex-shrink-0 w-32">
                <div
                  className={`p-4 rounded-xl text-center shadow-md transition-transform transform origin-center 
                    ${today ? "border-2 border-blue-500 ring-2 ring-blue-300 bg-blue-50 text-black" : "bg-white text-slate-700"}  
                    hover:bg-blue-100`}
                >
                  <div className="font-medium">{formatDate(day, "EEE")}</div>
                  <div className="text-lg font-semibold">{formatDate(day, "dd")}</div>
                </div>

                {/* Interactive Circle - Mood for past days, empty for future, + for today */}
                <div className="flex justify-center mt-3">
                  {today ? (
                    <button
                      onClick={() => setShowDiaryInput(true)}
                      className="w-10 h-10 rounded-full bg-green-500 border-2 border-green-600 text-white text-2xl font-bold hover:bg-green-600 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-md"
                    >
                      +
                    </button>
                  ) : (
                    (() => {
                      const now = new Date();
                      const isPast = day < now && !today;

                      return isPast ? (
                        <button
                          onClick={() => cycleMood(dayKey)}
                          className="w-10 h-10 rounded-full border-2 bg-white border-gray-300 hover:border-blue-400 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md flex items-center justify-center text-lg"
                        >
                          {moods[moodIndex ?? -1]?.emoji ?? "😐"}

                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diary Input Modal */}
      {showDiaryInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Add Diary Entry</h3>
            <textarea
              value={currentDiaryText}
              onChange={(e) => setCurrentDiaryText(e.target.value)}
              placeholder="How was your day?"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={addDiaryEntry}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowDiaryInput(false);
                  setCurrentDiaryText("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diary Entries Display */}
      {Object.keys(diaryEntries).length > 0 && (
        <div className="mt-8 w-full max-w-3xl pb-8">
          <h3 className="text-xl font-semibold mb-4 text-slate-700">Diary Entries</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.entries(diaryEntries)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([dateKey, entry]) => {
                const entryDate = new Date(dateKey);
                return (
                  <div key={dateKey} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="text-sm text-slate-500 mb-2">
                      {entryDate.toLocaleDateString('en', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-slate-700 whitespace-pre-wrap">{entry}</div>
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