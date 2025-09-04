"use client";

import React, { useState } from "react";
import { SideMenu } from "../_components/SideMenu";
import { useRouter } from "next/navigation";

interface ActivitiesListProps {
    onNavigate: (screen: "home" | "meditation") => void;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ onNavigate }) => {
    const router = useRouter();
    const activities = [
        { id: "meditation", title: "Meditation", color: "bg-indigo-400", text: "text-yellow-100", icon: "🧘", path: "/meditation" },
        { id: "gratitude", title: "Gratitude", color: "bg-red-400", text: "text-white", action: () => alert("Coming soon!"), icon: "💖", path: "/meditation" },
        { id: "mindfulness", title: "Mindfulness", color: "bg-amber-300", text: "text-gray-800", action: () => alert("Coming soon!"), icon: "🪷", path: "/meditation" },
        { id: "sleep", title: "Better Sleep", color: "bg-slate-700", text: "text-white", action: () => alert("Coming soon!"), icon: "😴", path: "/meditation" },
        { id: "breathing", title: "Breathing", color: "bg-green-200", text: "text-yellow-100", action: () => alert("Coming soon!"), icon: "🌬️", path: "/meditation" },
        { id: "journal", title: "Journaling", color: "bg-pink-300", text: "text-gray-800", action: () => alert("Coming soon!"), icon: "📓", path: "/meditation" },];


    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative">
            {/* <SideMenu /> */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    {/* <h1 className="text-2xl font-bold text-gray-800">Guided Activities</h1> */}
                    <p className="text-gray-400 text-md">Choose a topic to focus on:</p>
                </div>

                <div className="w-8" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {activities.map((activity) => (
                    <button
                        key={activity.id}
                        onClick={() => router.push(activity.path)}
                        className={`${activity.color} ${activity.text} rounded-xl h-32 flex flex-col items-center justify-center font-semibold text-lg shadow-md hover:scale-105 transition-transform`}
                    >
                        <span className="text-3xl mb-2">{activity.icon}</span>
                        {activity.title}
                    </button>
                ))}
            </div>

        </div>
    );
};

export default ActivitiesList;
