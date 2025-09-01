"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const menuItems = [
    { id: "diary", label: "Diary", icon: "📔", href: "/diary" },
    { id: "activities", label: "Guided Activities", icon: "🌟", href: "/activities" },
    { id: "farm", label: "My Farm", icon: "🌾", href: "/farm" },
    { id: 4, label: "Settings", icon: "⚙️" }
];

export const SideMenu: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <button
                className="p-2 rounded-md "
                onClick={() => setMenuOpen(true)}
            >
                <Menu className="w-6 h-6 text-gray-800" />
            </button>

            {menuOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex">
                    <div className="bg-white w-64 h-full shadow-lg p-6 flex flex-col animate-slide-in">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-800">WellNest</h2>
                            <button onClick={() => setMenuOpen(false)}>
                                <X className="w-6 h-6 text-gray-800" />
                            </button>
                        </div>

                        <nav className="flex flex-col space-y-4">
                            {menuItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className="flex items-center gap-3 p-2 rounded-md transition text-left"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-1" onClick={() => setMenuOpen(false)} />
                </div>
            )}
        </>
    );
};
