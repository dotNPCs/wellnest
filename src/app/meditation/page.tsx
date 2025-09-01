"use client";

import React, { useState, useEffect, useRef } from "react";

const durations = [5, 10, 15, 20];

export default function MeditationPage() {
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<number | null>(null);

    const startMeditation = () => {
        if (!selectedDuration) return;
        setTimeLeft(selectedDuration * 60);
        setIsRunning(true);
    };

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
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
    const progress = timeLeft && selectedDuration ? (timeLeft / (selectedDuration * 60)) * circumference : circumference;

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-indigo-100 to-indigo-200 flex flex-col items-center justify-center p-4">
            {!isRunning ? (
                <div className="w-full max-w-md text-center space-y-6">
                    <h1 className="text-3xl font-bold text-indigo-800">Meditation</h1>
                    <p className="text-indigo-700">Choose your session duration:</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {durations.map(d => (
                            <button
                                key={d}
                                className={`px-6 py-2 rounded-full font-semibold transition ${selectedDuration === d ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                    }`}
                                onClick={() => setSelectedDuration(d)}
                            >
                                {d} min
                            </button>
                        ))}
                    </div>
                    <button
                        className={`mt-4 px-6 py-3 rounded-full bg-indigo-700 text-white font-bold disabled:opacity-50`}
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
                            stroke="#c7d2fe"
                            strokeWidth="12"
                            fill="none"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            stroke="#4f46e5"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - progress}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <p className="text-4xl font-bold text-indigo-800">{formatTime(timeLeft)}</p>
                    <button
                        className="mt-4 px-6 py-3 rounded-full bg-indigo-700 text-white font-bold"
                        onClick={() => setIsRunning(false)}
                    >
                        Stop
                    </button>
                </div>
            )}
            <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-tr from-indigo-100 via-indigo-200 to-indigo-300 opacity-30 rounded-full"></div>
        </div>
    );
}
