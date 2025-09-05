/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { SpriteConfig } from "@/lib/spriteAnimations/gingerCat";

export interface IdleAnimationConfig {
  animations: string[];
  minInterval: number;
  maxInterval: number;
  specialAnimationDuration: number;
  defaultIdleAnimation: string;
  // New properties for night mode
  nightModeAnimations?: string[];
  nightModeDefaultIdle?: string;
}

export class CatIdleManager {
  private config: IdleAnimationConfig;
  private currentAnimation: string;
  private timeoutId: NodeJS.Timeout | null = null;
  private onAnimationChange: (animation: string) => void;
  private isActive: boolean = false;
  private isNightMode: boolean = false;

  constructor(
    config: IdleAnimationConfig,
    onAnimationChange: (animation: string) => void,
  ) {
    this.config = config;
    this.onAnimationChange = onAnimationChange;
    this.currentAnimation = this.config.defaultIdleAnimation;
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.updateNightMode();
    this.currentAnimation = this.getCurrentDefaultAnimation();
    this.onAnimationChange(this.getCurrentDefaultAnimation());
    this.scheduleNext();
  }

  stop() {
    this.isActive = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Method to check if it's nighttime
  private updateNightMode() {
    const now = new Date();
    const hour = now.getHours();
    // Night time is considered 10 PM to 6 AM
    this.isNightMode = hour >= 22 || hour < 6;
  }

  // Get the current default animation based on time of day
  private getCurrentDefaultAnimation(): string {
    return this.isNightMode
      ? (this.config.nightModeDefaultIdle ?? this.config.defaultIdleAnimation)
      : this.config.defaultIdleAnimation;
  }

  // Get available animations based on time of day
  private getCurrentAnimations(): string[] {
    return this.isNightMode
      ? (this.config.nightModeAnimations ?? this.config.animations)
      : this.config.animations;
  }

  private scheduleNext() {
    if (!this.isActive) return;

    // Update night mode status
    this.updateNightMode();
    const currentDefaultAnim = this.getCurrentDefaultAnimation();

    // If we're currently in the default animation, wait for interval then play special animation
    if (this.currentAnimation === currentDefaultAnim) {
      // In night mode, use longer intervals and mostly stick to sleeping
      const baseInterval = this.isNightMode
        ? Math.random() * 20000 + 30000 // 30-50 seconds for night
        : Math.random() * (this.config.maxInterval - this.config.minInterval) +
          this.config.minInterval;

      this.timeoutId = setTimeout(() => {
        if (!this.isActive) return;

        // In night mode, 80% chance to stay sleeping, 20% chance for a brief special animation
        if (this.isNightMode && Math.random() < 0.8) {
          // Stay in sleep mode, just reschedule
          this.scheduleNext();
          return;
        }

        const nextAnimation = this.getRandomSpecialAnimation();
        this.currentAnimation = nextAnimation;
        this.onAnimationChange(nextAnimation);

        // Duration for special animation (shorter at night)
        const specialDuration = this.isNightMode
          ? 1000 // Very brief animations at night
          : this.config.specialAnimationDuration;

        // After the special animation completes, return to default
        this.timeoutId = setTimeout(() => {
          if (!this.isActive) return;
          this.currentAnimation = this.getCurrentDefaultAnimation();
          this.onAnimationChange(this.getCurrentDefaultAnimation());
          this.scheduleNext(); // Schedule the next cycle
        }, specialDuration);
      }, baseInterval);
    }
  }

  private getRandomSpecialAnimation(): string {
    const currentAnimations = this.getCurrentAnimations();
    const currentDefault = this.getCurrentDefaultAnimation();

    // Get all animations except the default animation
    const specialAnimations = currentAnimations.filter(
      (anim) => anim !== currentDefault,
    );

    if (specialAnimations.length === 0) {
      return currentDefault;
    }

    return (
      specialAnimations[Math.floor(Math.random() * specialAnimations.length)] ??
      currentDefault
    );
  }

  getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  // Method to force night mode (useful for testing)
  setNightMode(isNight: boolean) {
    const wasNightMode = this.isNightMode;
    this.isNightMode = isNight;

    // If switching modes and currently active, switch to appropriate default animation
    if (this.isActive && wasNightMode !== isNight) {
      const newDefaultAnim = this.getCurrentDefaultAnimation();
      if (this.currentAnimation !== newDefaultAnim) {
        this.currentAnimation = newDefaultAnim;
        this.onAnimationChange(newDefaultAnim);
      }
    }
  }

  isInNightMode(): boolean {
    return this.isNightMode;
  }

  cleanup() {
    this.stop();
  }
}

export const createCatSpriteConfig = (
  catType: string = "default",
): SpriteConfig => ({
  imageUrl: `/sprites/ginger_cat_sprite.png`,
  frameWidth: 64,
  frameHeight: 64,
  totalFrames: 0,
  maxFramesPerRow: 15,
  startFrame: 5,
  animations: {
    meowSitFront: {
      row: 14,
      frameCount: 3,
      frameRate: 2,
      loop: true,
    },
    lickPawSitFront: {
      row: 12,
      frameCount: 8,
      frameRate: 2,
      loop: true,
    },
    lickPawLieFront: {
      row: 15,
      frameCount: 8,
      frameRate: 2,
      loop: true,
    },
    tailWagSitFront: {
      row: 19,
      frameCount: 5,
      frameRate: 2,
      loop: true,
    },
    sitFrontScratch: {
      row: 18,
      frameCount: 9,
      frameRate: 2,
    },
    rightPawSwipeSitFront: {
      row: 37,
      frameCount: 11,
      frameRate: 2,
      loop: true,
    },
    yawnSitFront: {
      row: 43,
      frameCount: 7,
      frameRate: 2,
      loop: true,
    },
    walkRight: {
      row: 5,
      frameCount: 6,
      frameRate: 8,
      loop: true,
    },
    walkLeft: {
      row: 4,
      startFrame: 5,
      frameCount: 6,
      frameRate: 8,
      loop: true,
    },
    runRight: {
      row: 10,
      frameCount: 5,
      frameRate: 12,
      loop: true,
    },
    runLeft: {
      row: 11,
      frameCount: 5,
      frameRate: 10,
      loop: false,
    },
    // Add sleeping animation (adjust row number based on your sprite sheet)
    sleepLieFront: {
      row: 44, // You'll need to adjust this to match your sprite sheet
      frameCount: 2,
      frameRate: 1, // Very slow animation for breathing effect
      loop: true,
    },
    eatFront: {
      row: 58,
      frameCount: 10,
      frameRate: 2,
      loop: false,
    },
    hissFront: {
      row: 61,
      frameCount: 1,
      frameRate: 2,
      loop: false,
    },
  },
});

// Updated idle manager with night mode support
export const createCatIdleManager = (
  onAnimationChange: (animation: string) => void,
): CatIdleManager => {
  const idleConfig: IdleAnimationConfig = {
    // Daytime animations
    animations: [
      "tailWagSitFront",
      "meowSitFront",
      "lickPawSitFront",
      "sitFrontScratch",
      "rightPawSwipeSitFront",
      "yawnSitFront",
    ],
    minInterval: 4000,
    maxInterval: 10000,
    specialAnimationDuration: 2500,
    defaultIdleAnimation: "tailWagSitFront",

    // Nighttime animations
    nightModeAnimations: [
      "sleepLieFront", // Primary sleep animation
      "yawnSitFront", // Occasional yawn
    ],
    nightModeDefaultIdle: "sleepLieFront",
  };

  return new CatIdleManager(idleConfig, onAnimationChange);
};

// Updated personality-based idle managers with night mode
export const createPlayfulCatIdleManager = (
  onAnimationChange: (animation: string) => void,
): CatIdleManager => {
  const playfulConfig: IdleAnimationConfig = {
    animations: ["tailWagSitFront", "rightPawSwipeSitFront", "meowSitFront"],
    minInterval: 2000,
    maxInterval: 5000,
    specialAnimationDuration: 2000,
    defaultIdleAnimation: "tailWagSitFront",
    nightModeAnimations: ["sleepLieFront", "yawnSitFront"],
    nightModeDefaultIdle: "sleepLieFront",
  };
  return new CatIdleManager(playfulConfig, onAnimationChange);
};

export const createMeditatingCatIdleManager = (
  onAnimationChange: (animation: string) => void,
): CatIdleManager => {
  const meditatingConfig: IdleAnimationConfig = {
    animations: ["sleepLieFront"],
    minInterval: 4000,
    maxInterval: 4000,
    specialAnimationDuration: 4000,
    defaultIdleAnimation: "sleepLieFront",
    nightModeAnimations: ["sleepLieFront"],
    nightModeDefaultIdle: "sleepLieFront",
  };
  return new CatIdleManager(meditatingConfig, onAnimationChange);
};

export const createLazyCatIdleManager = (
  onAnimationChange: (animation: string) => void,
): CatIdleManager => {
  const lazyConfig: IdleAnimationConfig = {
    animations: ["tailWagSitFront", "yawnSitFront", "lickPawSitFront"],
    minInterval: 5000,
    maxInterval: 12000,
    specialAnimationDuration: 3000,
    defaultIdleAnimation: "tailWagSitFront",
    nightModeAnimations: ["sleepLieFront"], // Lazy cats just sleep at night
    nightModeDefaultIdle: "sleepLieFront",
  };
  return new CatIdleManager(lazyConfig, onAnimationChange);
};

// Utility function to check if it's currently night time
export const isNightTime = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 22 || hour < 6;
};
