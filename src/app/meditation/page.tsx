"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PlasmaBackground from "@/components/ui/shadcn-io/plasma-background";
import { api } from "@/trpc/react";

const durations = [1, 5, 10, 15];

export default function MeditationPage() {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  const router = useRouter();

  const startMeditation = () => {
    if (!selectedDuration) return;
    setTimeLeft(selectedDuration * 60);
    setIsRunning(true);
  };

  const createActivityMutation = api.activity.createActivity.useMutation();

  const { data: todayActivities, isLoading } =
    api.activity.getActivities.useQuery({
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(23, 59, 59, 999)),
      activity: "MEDITATION",
    });

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      const logActivity = async () => {
        createActivityMutation.mutate({
          activity: "MEDITATION",
          durationMinutes: selectedDuration || 0,
        });
        setSelectedDuration(null);
      };
      logActivity();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress =
    timeLeft && selectedDuration
      ? (timeLeft / (selectedDuration * 60)) * circumference
      : circumference;

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <div className="absolute inset-0">
        <PlasmaBackground
          color="#3b82f6"
          speed={0.8}
          direction="forward"
          scale={1.8}
          opacity={0.6}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <button
        className="absolute top-4 left-4 z-20 rounded-full border border-white/30 bg-white/20 px-4 py-2 font-semibold text-white shadow backdrop-blur-md transition"
        onClick={() => router.push("/?tab=activities")}
      >
        ←
      </button>

      <motion.div
        className="relative z-10 flex min-h-screen items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        {!isRunning ? (
          <div className="w-full max-w-md space-y-6 text-center">
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
            >
              Meditation
            </motion.h1>

            <motion.p
              className="opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
            >
              Choose your session duration:
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4">
              {durations.map((d) => (
                <motion.button
                  key={d}
                  className={`rounded-full border px-6 py-2 font-semibold shadow-lg backdrop-blur-md transition-all duration-300 ${
                    selectedDuration === d
                      ? "scale-105 border-[#3b82f6]/80 bg-[#3b82f6]/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                      : "border-white/30 bg-white/20 text-white"
                  }`}
                  onClick={() => setSelectedDuration(d)}
                  whileTap={{ scale: 0.95 }}
                >
                  {d} min
                </motion.button>
              ))}
            </div>

            <motion.button
              className={`mt-6 rounded-full px-6 py-3 font-bold text-white shadow-lg transition ${
                selectedDuration
                  ? "bg-[#3b82f6]/50 shadow-black/20"
                  : "bg-white/20 text-white/50 shadow-black/5"
              }`}
              onClick={startMeditation}
              disabled={!selectedDuration}
            >
              Start Meditation
            </motion.button>
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <svg className="h-64 w-64" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#3b82f6"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <p className="text-4xl font-bold">{formatTime(timeLeft)}</p>
            <button
              className="mt-4 rounded-full bg-[#3b82f6]/50 px-6 py-3 font-bold text-white shadow-black/20"
              onClick={() => setIsRunning(false)}
            >
              Stop
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
