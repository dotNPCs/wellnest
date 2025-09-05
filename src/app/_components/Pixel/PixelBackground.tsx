import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

const AssetBackground = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  const [timePhase, setTimePhase] = useState("day");
  const [backgroundSrc, setBackgroundSrc] = useState("/backgrounds/midday.png");
  const [colors, setColors] = useState({
    ground: ["#8B4513", "#654321"],
    grass: ["#228B22", "#32CD32", "#90EE90"],
    clouds: { color: "#FFFFFF", opacity: 0.8 },
  });

  // Get time-based phase and corresponding asset

  const getTimePhase = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;

    // Define time phases
    const dawn = { start: 5 * 60, end: 7 * 60 }; // 5-7 AM
    const day = { start: 7 * 60, end: 17 * 60 }; // 7 AM - 5 PM
    const dusk = { start: 17 * 60, end: 19 * 60 }; // 5-7 PM
    const night = { start: 19 * 60, end: 24 * 60 }; // 7 PM - 12 AM
    const lateNight = { start: 0, end: 5 * 60 }; // 12 AM - 5 AM

    let phase, assetPath, colors;

    if (totalMinutes >= dawn.start && totalMinutes < dawn.end) {
      phase = "morning";
      assetPath = "/backgrounds/morning.png";
      colors = {
        ground: ["#654321", "#4A3018"],
        grass: ["#2D5A2D", "#3F7F3F", "#5FAF5F"],
        clouds: { color: "#FFB6C1", opacity: 0.8 },
      };
    } else if (totalMinutes >= day.start && totalMinutes < day.end) {
      phase = "midday";
      assetPath = "/backgrounds/midday.png";
      colors = {
        ground: ["#8B4513", "#654321"],
        grass: ["#228B22", "#32CD32", "#90EE90"],
        clouds: { color: "#FFFFFF", opacity: 0.8 },
      };
    } else if (totalMinutes >= dusk.start && totalMinutes < dusk.end) {
      phase = "evening";
      assetPath = "/backgrounds/evening.png";
      colors = {
        ground: ["#5D3A1A", "#4A2C12"],
        grass: ["#1F4A1F", "#2D5A2D", "#3F6F3F"],
        clouds: { color: "#FFB347", opacity: 0.9 },
      };
    } else {
      phase = "night";
      assetPath = "/backgrounds/night.png";
      colors = {
        ground: ["#3C2415", "#2B1A0F"],
        grass: ["#1B3B1B", "#2A4A2A", "#3A5A3A"],
        clouds: { color: "#E6E6FA", opacity: 0.6 },
      };
    }

    return { phase, assetPath, colors };
  };

  useEffect(() => {
    const updateTimePhase = () => {
      const { phase, assetPath, colors } = getTimePhase();
      setColors(colors);
      setTimePhase(phase);
      setBackgroundSrc(assetPath);
    };

    // Update immediately
    updateTimePhase();

    // Update every minute
    const interval = setInterval(updateTimePhase, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle parallax movement for clouds
      gsap.to(cloudsRef.current, {
        x: -50,
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Gentle background drift (optional - creates subtle movement)
      gsap.to(backgroundImageRef.current, {
        x: -10,
        y: -5,
        duration: 30,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Twinkling stars animation (only visible at night)
      if (timePhase === "night") {
        gsap.to(starsRef.current?.children || [], {
          opacity: 0.2,
          duration: 2,
          repeat: -1,
          yoyo: true,
          stagger: 0.3,
          ease: "power2.inOut",
        });
      }
    }, backgroundRef);

    return () => ctx.revert();
  }, [timePhase]);

  return (
    <div
      ref={backgroundRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Main Background Image */}
      <img
        ref={backgroundImageRef}
        src={backgroundSrc}
        alt={`${timePhase} background`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scale(1.1)" }} // Slight scale to allow for movement
      />

      {/* Additional Stars Overlay (only for night) */}
      {timePhase === "night" && (
        <div ref={starsRef} className="absolute inset-0">
          <div className="absolute top-[10%] left-[15%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[15%] left-[25%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[8%] left-[35%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[20%] left-[45%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[12%] left-[55%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[18%] left-[65%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[6%] left-[75%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute top-[22%] left-[85%] h-1 w-1 animate-pulse rounded-full bg-white" />
        </div>
      )}

      <div className="absolute bottom-0 w-full">
        {/* Ground Layer 1 - Base ground */}
        <div
          className="absolute bottom-0 h-20 w-[200%]"
          style={{
            background: `linear-gradient(180deg, ${colors.ground[0]} 0%, ${colors.ground[1]} 100%)`,
          }}
        />

        {/* Ground Layer 2 - Grass and details */}
        <div
          className="absolute bottom-0 h-16 w-[200%]"
          style={{
            background: `linear-gradient(180deg, ${colors.grass[0]} 0%, ${colors.grass[1]} 50%, ${colors.grass[2]} 100%)`,
            clipPath: `polygon(0 40%, 5% 30%, 10% 35%, 15% 25%, 20% 30%, 25% 20%, 30% 25%, 35% 15%, 40% 20%, 45% 10%, 50% 15%, 55% 5%, 60% 10%, 65% 0%, 70% 5%, 75% 0%, 80% 10%, 85% 5%, 90% 15%, 95% 10%, 100% 20%, 100% 100%, 0 100%)`,
          }}
        />
      </div>
      {/* Optional Floating Clouds Overlay */}
      <div
        ref={cloudsRef}
        className="pointer-events-none absolute top-10 h-20 w-[200%]"
      >
        <div className="absolute top-2 left-[10%] h-8 w-16 rounded-full bg-white opacity-20" />
        <div className="absolute top-0 left-[12%] h-6 w-12 rounded-full bg-white opacity-15" />
        <div className="absolute top-6 left-[40%] h-10 w-20 rounded-full bg-white opacity-25" />
        <div className="absolute top-4 left-[42%] h-8 w-16 rounded-full bg-white opacity-20" />
        <div className="absolute top-8 left-[70%] h-7 w-14 rounded-full bg-white opacity-20" />
      </div>
    </div>
  );
};

export default AssetBackground;
