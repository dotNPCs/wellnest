"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PlasmaBackground from "@/components/ui/shadcn-io/plasma-background";

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

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
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
                    opacity={0.9}
                />
                <div className="absolute inset-0 bg-black/80" />
            </div>

            <button
                className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow text-white font-semibold hover:bg-white/30 transition z-20"
                onClick={() => router.push("/?tab=activities")}
            >
                ←
            </button>

            <div className="relative z-10 flex items-center justify-center min-h-screen">
                {!isRunning ? (
                    <div className="w-full max-w-md text-center space-y-6">
                        <h1 className="text-3xl font-bold">Meditation</h1>
                        <p className="opacity-90">Choose your session duration:</p>

                        <div className="flex justify-center gap-4 flex-wrap">
                            {durations.map((d) => (
                                <button
                                    key={d}
                                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 backdrop-blur-md border shadow-lg 
          ${selectedDuration === d
                                            ? "bg-[#3b82f6]/40 text-white border-[#3b82f6]/80 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105"
                                            : "bg-white/20 text-white border-white/30"
                                        }`}
                                    onClick={() => setSelectedDuration(d)}
                                >
                                    {d} min
                                </button>
                            ))}
                        </div>

                        <button
                            className={`mt-6 px-6 py-3 rounded-full transition text-white font-bold shadow-lg
    ${selectedDuration
                                    ? "bg-[#3b82f6]/50 shadow-black/20"
                                    : "bg-white/20 text-white/50 shadow-black/5"
                                }`}
                            onClick={startMeditation}
                            disabled={!selectedDuration}
                        >
                            Start Meditation
                        </button>

                    </div>

                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <svg className="w-64 h-64" viewBox="0 0 200 200">
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
                            className="mt-4 px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold bg-[#3b82f6]/50 shadow-black/20"
                            onClick={() => setIsRunning(false)}
                        >
                            Stop
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

}
