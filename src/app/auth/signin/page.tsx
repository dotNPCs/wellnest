"use client";
import { useEffect, useRef } from "react";
import { FaDiscord } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { gsap } from "gsap";

const SignInPage = () => {
  const skyRef = useRef(null);
  const cloudsLayer1Ref = useRef(null);
  const cloudsLayer2Ref = useRef(null);
  const cloudsLayer3Ref = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // Import GSAP dynamically

    // Animate background layers
    gsap.to(cloudsLayer1Ref.current, {
      x: "-50%",
      duration: 60,
      ease: "none",
      repeat: -1,
    });

    gsap.to(cloudsLayer2Ref.current, {
      x: "-50%",
      duration: 80,
      ease: "none",
      repeat: -1,
    });

    gsap.to(cloudsLayer3Ref.current, {
      x: "-50%",
      duration: 100,
      ease: "none",
      repeat: -1,
    });

    // Animate card entrance
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
      },
    );

    // Subtle floating animation for the card
    gsap.to(cardRef.current, {
      y: -10,
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 1.5,
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Sky Background */}
      <div
        ref={skyRef}
        className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-100"
      />

      {/* Cloud Layer 1 - Back */}
      <div
        ref={cloudsLayer1Ref}
        className="absolute inset-0"
        style={{ width: "200%" }}
      >
        <img
          src="/backgrounds/login/2.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Cloud Layer 2 - Middle */}
      <div
        ref={cloudsLayer2Ref}
        className="absolute inset-0"
        style={{ width: "200%" }}
      >
        <img
          src="/backgrounds/login/3.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Cloud Layer 3 - Front */}
      <div
        ref={cloudsLayer3Ref}
        className="absolute inset-0"
        style={{ width: "200%" }}
      >
        <img
          src="/backgrounds/login/4.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-4 p-8">
        <div
          ref={cardRef}
          className="flex w-full max-w-sm flex-col justify-center gap-6 rounded-xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-sm"
        >
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-center text-3xl font-bold text-transparent">
            WellNest.
          </h1>
          <p className="text-center text-gray-600">
            Start taking care of your pet, and take care of yourself too.
          </p>

          <button
            onClick={() => signIn("discord")}
            className="group flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg bg-indigo-500 py-3 font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-lg active:scale-95"
          >
            <FaDiscord
              size={20}
              className="transition-transform group-hover:scale-110"
            />
            Sign in with Discord
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
