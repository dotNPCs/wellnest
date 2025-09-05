import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  createCatSpriteConfig,
  createCatIdleManager,
} from "@/lib/spriteConfig/gingerCat";
import { useSpriteAnimation } from "@/lib/spriteAnimations/gingerCat";
import type { UserPet } from "@prisma/client";

// Define the interface for exposed methods
export interface PetSpriteRef {
  triggerEating: () => void;
  triggerMeow: () => void;
  triggerScratch: () => void;
  triggerYawn: () => void;
  triggerPawSwipe: () => void;
  triggerLickPaw: () => void;
  triggerSleep: () => void;
  triggerHiss: () => void;
  resumeIdle: () => void;
}

const PetSprite = forwardRef<PetSpriteRef, { pet: UserPet; mood?: string }>(
  ({ mood, pet }, ref) => {
    const petRef = useRef<HTMLDivElement>(null);

    const [currentAnimation, setCurrentAnimation] = useState("idle");
    const [isManualAnimation, setIsManualAnimation] = useState(false);
    const [touchCount, setTouchCount] = useState(0);
    const idleManagerRef = useRef<ReturnType<
      typeof createCatIdleManager
    > | null>(null);

    // Configure your cat sprite
    const spriteConfig = createCatSpriteConfig();
    const { elementRef, playAnimation } = useSpriteAnimation(spriteConfig);

    // Animation change handler for the idle manager
    const handleAnimationChange = useCallback(
      (animation: string) => {
        if (!isManualAnimation) {
          setCurrentAnimation(animation);
        }
      },
      [isManualAnimation],
    );

    // Initialize idle manager
    useEffect(() => {
      idleManagerRef.current = createCatIdleManager(handleAnimationChange);
      return () => {
        idleManagerRef.current?.cleanup();
      };
    }, [handleAnimationChange]);

    // Handle mood changes and idle management
    useEffect(() => {
      const isSleeping =
        mood?.toLowerCase().includes("sleep") ||
        mood?.toLowerCase().includes("tired");

      if (isSleeping) {
        idleManagerRef.current?.stop();
        playAnimation("sleepLieFront");
      } else if (!isManualAnimation) {
        idleManagerRef.current?.start();
        playAnimation(currentAnimation);
      }
    }, [mood, currentAnimation, playAnimation, isManualAnimation]);

    // Play current animation when it changes
    useEffect(() => {
      if (!isManualAnimation && currentAnimation !== "tailWagSitFront") {
        playAnimation(currentAnimation);
      }
    }, [currentAnimation, isManualAnimation, playAnimation]);

    // Trigger animation with auto-return to idle
    const triggerAnimation = useCallback(
      (animationName: string, duration: number = 2500) => {
        setIsManualAnimation(true);
        idleManagerRef.current?.stop();

        console.log(`Triggering animation: ${animationName}`);
        playAnimation(animationName);

        // Return to idle after specified duration
        setTimeout(() => {
          setIsManualAnimation(false);
          idleManagerRef.current?.start();
        }, duration);
      },
      [playAnimation],
    );

    // Expose trigger methods via ref
    useImperativeHandle(
      ref,
      () => ({
        triggerEating: () => triggerAnimation("lickPawSitFront", 3000),
        triggerMeow: () => triggerAnimation("meowSitFront", 2000),
        triggerScratch: () => triggerAnimation("sitFrontScratch", 2500),
        triggerYawn: () => triggerAnimation("yawnSitFront", 2000),
        triggerPawSwipe: () => triggerAnimation("rightPawSwipeSitFront", 2000),
        triggerLickPaw: () => triggerAnimation("lickPawLieFront", 3000),
        triggerHiss: () => triggerAnimation("hissFront", 2000),
        triggerSleep: () => {
          setIsManualAnimation(true);
          idleManagerRef.current?.stop();
          playAnimation("sleepLieFront");
        },
        resumeIdle: () => {
          setIsManualAnimation(false);
          idleManagerRef.current?.start();
        },
      }),
      [triggerAnimation, playAnimation],
    );

    return (
      <div
        ref={petRef}
        className="absolute -bottom-5 left-1/2 z-10 -translate-x-1/2 transform"
        onClick={() => {
          pet.familiarity > 25
            ? triggerAnimation("meowSitFront")
            : triggerAnimation("hissFront");
        }} // desktop click
        onTouchStart={() =>
          pet.familiarity > 25
            ? triggerAnimation("meowSitFront")
            : triggerAnimation("hissFront")
        } // mobile touch
      >
        <div className="relative">
          <div
            ref={elementRef}
            className="pixel-perfect"
            style={{
              width: "64px",
              height: "64px",
              translate: "50px 0",
              transform: "scale(5)",
              transformOrigin: "bottom",
            }}
          />
          <div className="absolute -bottom-2 left-1/2 h-3 w-16 -translate-x-1/2 transform rounded-full bg-black opacity-20 blur-sm" />
        </div>
      </div>
    );
  },
);

PetSprite.displayName = "PetSprite";

export default PetSprite;
