import { useRef, useEffect } from "react";
import {
  createCatSpriteConfig,
  createMeditatingCatIdleManager,
} from "@/lib/spriteConfig/gingerCat";
import { useSpriteAnimation } from "@/lib/spriteAnimations/gingerCat";
import type { UserPet } from "@prisma/client";

const MeditationSprite = () => {
  const petRef = useRef<HTMLDivElement>(null);
  const idleManagerRef = useRef<ReturnType<
    typeof createMeditatingCatIdleManager
  > | null>(null);

  // Configure meditation sprite
  const spriteConfig = createCatSpriteConfig();
  const { elementRef, playAnimation } = useSpriteAnimation(spriteConfig);

  // Start meditation idle manager
  useEffect(() => {
    idleManagerRef.current = createMeditatingCatIdleManager((animation) => {
      playAnimation(animation);
    });

    idleManagerRef.current.start();

    return () => {
      idleManagerRef.current?.cleanup();
    };
  }, [playAnimation]);

  return (
    <div ref={petRef} className="">
      <div className="absolute bottom-35 left-1/2 -translate-x-1/2">
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
      </div>
    </div>
  );
};

MeditationSprite.displayName = "MeditationSprite";

export default MeditationSprite;
