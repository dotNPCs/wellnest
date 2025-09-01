"use client";

import React, { useState, useRef, useEffect } from "react";

interface CustomDrawerProps {
  children: React.ReactNode;
  title?: string;
  allowDragUp?: boolean;
  className?: string;
}

export default function CustomDrawer({
  children,
  title,
  allowDragUp = false,
  className = "",
}: CustomDrawerProps) {
  const [height, setHeight] = useState<number>(50); // Start at 50% height
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startHeight, setStartHeight] = useState<number>(50);
  const drawerRef = useRef<HTMLDivElement>(null);

  const minHeight = 50; // 50% minimum
  const [maxHeight, setMaxHeight] = useState<number>(100);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMaxHeight(Math.min((900 / window.innerHeight) * 100, 100));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!allowDragUp) return;

    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(height);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!allowDragUp) return;

    setIsDragging(true);
    setStartY(e.touches[0]!.clientY);
    setStartHeight(height);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !allowDragUp) return;

      const deltaY = startY - e.clientY;
      const viewportHeight = window.innerHeight;
      const deltaPercentage = (deltaY / viewportHeight) * 100;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, startHeight + deltaPercentage),
      );

      setHeight(newHeight);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !allowDragUp) return;

      const deltaY = startY - e.touches[0]!.clientY;
      const viewportHeight = window.innerHeight;
      const deltaPercentage = (deltaY / viewportHeight) * 100;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, startHeight + deltaPercentage),
      );

      setHeight(newHeight);
    };

    const handleEnd = () => {
      if (!isDragging) return;

      setIsDragging(false);

      // Snap to closest point
      if (allowDragUp) {
        const midPoint = (minHeight + maxHeight) / 2;
        if (height < midPoint) {
          setHeight(minHeight);
        } else {
          setHeight(maxHeight);
        }
      } else {
        setHeight(minHeight);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [
    isDragging,
    startY,
    startHeight,
    height,
    allowDragUp,
    minHeight,
    maxHeight,
  ]);

  return (
    <div
      ref={drawerRef}
      className={`fixed right-0 bottom-0 left-0 z-50 rounded-t-xl border-t border-gray-200 bg-white shadow-lg transition-all duration-200 dark:border-gray-700 dark:bg-gray-900 ${className}`}
      style={{
        height: `${height}vh`,
        minHeight: "50vh",
        maxHeight: allowDragUp ? "900px" : "50vh",
      }}
    >
      {/* Drag handle */}
      <div
        className={`flex w-full justify-center py-2 ${allowDragUp ? "cursor-grab active:cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={`h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600 ${allowDragUp ? "hover:bg-gray-400 dark:hover:bg-gray-500" : ""} transition-colors`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
