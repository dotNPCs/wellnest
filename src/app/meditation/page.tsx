"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PlasmaBackground from "@/components/ui/shadcn-io/plasma-background";

const durations = [0.1, 1, 5, 10, 15];

export default function MeditationPage() {
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const timerRef = useRef<number | null>(null);
    const router = useRouter();

    const startMeditation = () => {
        if (!selectedDuration) return;
        setTimeLeft(selectedDuration * 60);
        setIsRunning(true);
    };

    // Timer effect only handles decrementing
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            setShowModal(true);
        }
    }, [timeLeft, isRunning]);


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

    const closeModal = (action: "home" | "meditate") => {
        setShowModal(false);
        if (action === "home") router.push("/?tab=activities");
        else {
            setSelectedDuration(null);
        }
    };

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
                className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow text-white font-semibold transition z-20"
                onClick={() => router.push("/?tab=activities")}
            >
                ←
            </button>

            <motion.div
                className="relative z-10 flex items-center justify-center min-h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            >
                {!isRunning ? (
                    <div className="w-full max-w-md text-center space-y-6">
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

                        <div className="flex justify-center gap-4 flex-wrap">
                            {durations.map((d) => (
                                <motion.button
                                    key={d}
                                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 backdrop-blur-md border shadow-lg
                    ${selectedDuration === d
                                            ? "bg-[#3b82f6]/40 text-white border-[#3b82f6]/80 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105"
                                            : "bg-white/20 text-white border-white/30"
                                        }`}
                                    onClick={() => setSelectedDuration(d)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {d} min
                                </motion.button>
                            ))}
                        </div>

                        <motion.button
                            className={`mt-6 px-6 py-3 rounded-full transition text-white font-bold shadow-lg
                ${selectedDuration
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
                            className="mt-4 px-6 py-3 rounded-full bg-[#3b82f6]/50 text-white font-bold shadow-black/20"
                            onClick={() => setIsRunning(false)}
                        >
                            Stop
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white mx-5 rounded-xl p-8 max-w-sm text-center space-y-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="mb-1 ml-3 text-lg font-bold" style={{ color: '#5A6B4D' }}>
                                Meditation Complete
                            </h2>
                            <p className="text-md text-black/60">
                                Well done! You’ve just taken a few minutes to center yourself.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="px-4 py-2 bg-[#3b82f6] text-white rounded-full font-semibold shadow"
                                    onClick={() => closeModal("home")}
                                >
                                    Return Home
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow"
                                    onClick={() => closeModal("meditate")}
                                >
                                    Meditate Again
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
