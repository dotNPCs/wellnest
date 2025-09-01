"use client";

import React, { useState } from "react";
import { SideMenu } from "../_components/SideMenu";

interface ActivitiesScreenProps {
    onNavigate: (screen: "home" | "meditation") => void;
}

const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({ onNavigate }) => {
    const activities = [
        { id: "meditation", title: "Meditation", color: "bg-indigo-400", text: "text-yellow-100", action: () => onNavigate("meditation") },
        { id: "gratitude", title: "Gratitude", color: "bg-red-400", text: "text-white", action: () => alert("Coming soon!") },
        { id: "exercise", title: "Exercise", color: "bg-orange-300", text: "text-gray-800", action: () => alert("Coming soon!") },
        { id: "mindfulness", title: "Mindfulness", color: "bg-amber-300", text: "text-gray-800", action: () => alert("Coming soon!") },
        { id: "breathing", title: "Breathing", color: "bg-green-400", text: "text-yellow-100", action: () => alert("Coming soon!") },
        { id: "sleep", title: "Better Sleep", color: "bg-slate-700", text: "text-white", action: () => alert("Coming soon!") },
        { id: "journal", title: "Journaling", color: "bg-pink-300", text: "text-gray-800", action: () => alert("Coming soon!") },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 relative">
            <SideMenu />
            <div className="flex items-center justify-between my-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">Guided Activities</h1>
                    <p className="text-gray-400 text-sm">Choose a topic to focus on:</p>
                </div>

                <div className="w-8" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {activities.map((activity) => (
                    <button
                        key={activity.id}
                        onClick={activity.action}
                        className={`${activity.color} ${activity.text} rounded-xl h-32 flex items-center justify-center font-semibold text-lg shadow-md hover:scale-105 transition-transform`}
                    >
                        {activity.title}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ActivitiesScreen;
