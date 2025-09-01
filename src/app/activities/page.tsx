"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface ActivitiesScreenProps {
    onNavigate: (screen: "home" | "meditation") => void;
}

const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({ onNavigate }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const activities = [
        { id: "meditation", title: "Meditation", color: "bg-indigo-400", text: "text-yellow-100", action: () => onNavigate("meditation") },
        { id: "gratitude", title: "Gratitude", color: "bg-red-400", text: "text-white", action: () => alert("Coming soon!") },
        { id: "exercise", title: "Exercise", color: "bg-orange-300", text: "text-gray-800", action: () => alert("Coming soon!") },
        { id: "mindfulness", title: "Mindfulness", color: "bg-amber-300", text: "text-gray-800", action: () => alert("Coming soon!") },
        { id: "breathing", title: "Breathing", color: "bg-green-400", text: "text-yellow-100", action: () => alert("Coming soon!") },
        { id: "sleep", title: "Better Sleep", color: "bg-slate-700", text: "text-white", action: () => alert("Coming soon!") },
        { id: "journal", title: "Journaling", color: "bg-pink-300", text: "text-gray-800", action: () => alert("Coming soon!") },
    ];

    const menuItems = [
        { id: "diary", label: "Diary", icon: "📔" },
        { id: "activities", label: "Guided Activities", icon: "🌟" },
        { id: "farm", label: "My Farm", icon: "🌾" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 relative">
            <div className="flex items-center justify-between mb-6">
                <button
                    className="p-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setMenuOpen(true)}
                >
                    <Menu className="w-6 h-6 text-gray-800" />
                </button>

                <div className="flex-1 text-center">
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

            {menuOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex">
                    <div className="bg-white w-64 h-full shadow-lg p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                            <button onClick={() => setMenuOpen(false)}>
                                <X className="w-6 h-6 text-gray-800" />
                            </button>
                        </div>

                        <nav className="flex flex-col space-y-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition text-left"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-1" onClick={() => setMenuOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default ActivitiesScreen;
