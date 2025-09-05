"use client";

import React, { useState } from "react";
import { SideMenu } from "../_components/SideMenu";
import { useRouter } from "next/navigation";
import Image from "next/image";


interface ActivitiesListProps {
    onNavigate: (screen: "home" | "meditation") => void;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ onNavigate }) => {
    const router = useRouter();
    const activities = [
        {
            id: "meditation",
            title: "Meditation",
            desc: "Get into the right headspace.",
            color: "bg-gradient-to-br from-[#6E825D] to-[#A3B58C]", // richer green gradient
            text: "black",
            icon: "meditationCat",
            path: "/meditation",
        },
        {
            id: "gratitude",
            title: "Gratitude",
            desc: "Recall 3 things you're grateful for.",
            color: "bg-gradient-to-br from-[#4C4E42] to-[#7B7E6D]", // darker to medium contrast
            text: "black",
            icon: "gratitudeCat",
            path: "/meditation",
        },
        {
            id: "mindfulness",
            title: "Mindfulness",
            desc: "Be present and notice the now.",
            color: "bg-gradient-to-br from-[#6E825D] to-[#B2C49A]", // slightly brighter
            text: "black",
            icon: "mindfulnessCat",
            path: "/meditation",
        },
        {
            id: "sleep",
            title: "Better Sleep",
            desc: "Unwind and prepare for deep rest.",
            color: "bg-gradient-to-br from-[#1B1C17] to-[#505347]", // richer dark gradient
            text: "black",
            icon: "bettersleepCat",
            path: "/meditation",
        },
        {
            id: "breathing",
            title: "Breathing",
            desc: "Calm your mind with steady breaths.",
            color: "bg-gradient-to-br from-[#6E825D] to-[#C1D3A0]", // more vibrant green
            text: "black",
            icon: "breathingCat",
            path: "/meditation",
        },
        {
            id: "affirmation",
            title: "Affirmation",
            desc: "Boost positivity with a daily affirmation.",
            color: "bg-gradient-to-br from-[#9AB18B] to-[#D0E0C1]", // light, lively green gradient
            text: "text-[#1B1C17]",
            icon: "affirmationCat",
            path: "/meditation",
        },
    ];




    return (
        <div className="min-h-screen overflow-auto">
            {/* <SideMenu /> */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <h3 className="mb-1 ml-3 text-lg font-bold" style={{ color: '#5A6B4D' }}>
                        Choose a topic to focus on:
                    </h3>
                </div>

                <div className="w-8" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {activities.map((activity) => (
                    <button
                        key={activity.id}
                        onClick={() => router.push(activity.path)}
                        className={`relative py-20 rounded-xl h-32 flex flex-col items-center justify-center
               bg-white border-2 border-[#5A6B4D] text-[#5A6B4D] font-semibold text-lg
               shadow-md transition-transform `}
                    >
                        <Image
                            src={`/activityIcons/${activity.icon}.png`}
                            alt={activity.title}
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <span className="font-semibold text-lg mt-2 text-black">{activity.title}</span>
                        <span className="px-2 text-xs font-light opacity-80 text-black">{activity.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ActivitiesList;
