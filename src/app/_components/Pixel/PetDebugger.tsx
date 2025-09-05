"use client";

import React, { useState, useRef, useEffect } from "react";

const SpriteDebugger: React.FC = () => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [maxFrames, setMaxFrames] = useState(8); // Adjust based on your max frames per row
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500); // milliseconds
  const spriteRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const frameWidth = 64;
  const frameHeight = 64;
  const totalRows = 62;

  // Update sprite display
  useEffect(() => {
    if (spriteRef.current) {
      const x = currentFrame * frameWidth;
      const y = currentRow * frameHeight;
      spriteRef.current.style.backgroundPosition = `-${x}px -${y}px`;
    }
  }, [currentRow, currentFrame]);

  // Handle auto-play animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % maxFrames);
      }, animationSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, animationSpeed, maxFrames]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextRow = () => {
    if (currentRow < totalRows - 1) {
      setCurrentRow(currentRow + 1);
      setCurrentFrame(0);
    }
  };

  const prevRow = () => {
    if (currentRow > 0) {
      setCurrentRow(currentRow - 1);
      setCurrentFrame(0);
    }
  };

  return (
    <div className="bg-opacity-90 fixed top-4 left-4 z-50 max-w-xs rounded-lg bg-black p-4 font-mono text-sm text-white">
      <h3 className="mb-4 text-center text-lg font-bold">Sprite Debugger</h3>

      {/* Sprite Display */}
      <div className="mb-4 flex justify-center">
        <div className="relative border-2 border-white">
          <div
            ref={spriteRef}
            className="h-16 w-16"
            style={{
              backgroundImage: "url(/sprites/ginger_cat_sprite.png)",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              transform: "scale(2)",
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>

      {/* Current Info */}
      <div className="mb-4 space-y-1 text-center">
        <div>
          Row: {currentRow} / {totalRows - 1}
        </div>
        <div>
          Frame: {currentFrame} / {maxFrames - 1}
        </div>
        <div>
          Position: {currentFrame * frameWidth}px, {currentRow * frameHeight}px
        </div>
      </div>

      {/* Row Controls */}
      <div className="mb-3 flex justify-between">
        <button
          onClick={prevRow}
          disabled={currentRow === 0}
          className="rounded bg-blue-600 px-3 py-1 disabled:bg-gray-600"
        >
          ↑ Row
        </button>
        <button
          onClick={nextRow}
          disabled={currentRow === totalRows - 1}
          className="rounded bg-blue-600 px-3 py-1 disabled:bg-gray-600"
        >
          ↓ Row
        </button>
      </div>

      {/* Row Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={totalRows - 1}
          value={currentRow}
          onChange={(e) => {
            setCurrentRow(parseInt(e.target.value));
            setCurrentFrame(0);
          }}
          className="w-full"
        />
      </div>

      {/* Frame Controls */}
      <div className="mb-3 flex justify-between">
        <button
          onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
          disabled={currentFrame === 0}
          className="rounded bg-green-600 px-3 py-1 disabled:bg-gray-600"
        >
          ← Frame
        </button>
        <button
          onClick={togglePlay}
          className={`rounded px-3 py-1 ${isPlaying ? "bg-red-600" : "bg-green-600"}`}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
        <button
          onClick={() =>
            setCurrentFrame(Math.min(maxFrames - 1, currentFrame + 1))
          }
          disabled={currentFrame === maxFrames - 1}
          className="rounded bg-green-600 px-3 py-1 disabled:bg-gray-600"
        >
          → Frame
        </button>
      </div>

      {/* Frame Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={maxFrames - 1}
          value={currentFrame}
          onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <div>
          <label className="block text-xs">Max Frames per Row:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxFrames}
            onChange={(e) => setMaxFrames(parseInt(e.target.value) || 8)}
            className="w-full rounded bg-gray-800 px-2 py-1 text-white"
          />
        </div>
        <div>
          <label className="block text-xs">Speed (ms):</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-xs">{animationSpeed}ms</div>
        </div>
      </div>

      {/* Animation Notes */}
      <div className="mt-4 rounded bg-gray-800 p-2 text-xs">
        <div className="mb-1 font-bold">Notes for Row {currentRow}:</div>
        <textarea
          placeholder="Describe this animation..."
          className="h-16 w-full resize-none rounded bg-gray-700 p-1 text-xs text-white"
        />
      </div>
    </div>
  );
};

export default SpriteDebugger;
