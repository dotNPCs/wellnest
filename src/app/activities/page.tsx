"use client";

import React, { useState } from "react";
import { SideMenu } from "../_components/SideMenu";
import { useRouter } from "next/navigation";

// Remove the props interface since this is a page component
export default function ActivitiesScreen() {
  const router = useRouter();
  const activities = [
    {
      id: "meditation",
      title: "Meditation",
      color: "bg-indigo-400",
      text: "text-yellow-100",
      icon: "🧘",
      path: "/meditation",
    },
    {
      id: "gratitude",
      title: "Gratitude",
      color: "bg-red-400",
      text: "text-white",
      action: () => alert("Coming soon!"),
      icon: "💖",
      path: "/meditation",
    },
    {
      id: "mindfulness",
      title: "Mindfulness",
      color: "bg-amber-300",
      text: "text-gray-800",
      action: () => alert("Coming soon!"),
      icon: "🪷",
      path: "/meditation",
    },
    {
      id: "sleep",
      title: "Better Sleep",
      color: "bg-slate-700",
      text: "text-white",
      action: () => alert("Coming soon!"),
      icon: "😴",
      path: "/meditation",
    },
    {
      id: "breathing",
      title: "Breathing",
      color: "bg-green-200",
      text: "text-yellow-100",
      action: () => alert("Coming soon!"),
      icon: "🌬️",
      path: "/meditation",
    },
    {
      id: "journal",
      title: "Journaling",
      color: "bg-pink-300",
      text: "text-gray-800",
      action: () => alert("Coming soon!"),
      icon: "📓",
      path: "/meditation",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <SideMenu />
      <div className="my-6 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Guided Activities
          </h1>
          <p className="text-sm text-gray-400">Choose a topic to focus on:</p>
        </div>

        <div className="w-8" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => router.push(activity.path)}
            className={`${activity.color} ${activity.text} flex h-32 flex-col items-center justify-center rounded-xl text-lg font-semibold shadow-md transition-transform hover:scale-105`}
          >
            <span className="mb-2 text-3xl">{activity.icon}</span>
            {activity.title}
          </button>
        ))}
      </div>
    </div>
  );
}
