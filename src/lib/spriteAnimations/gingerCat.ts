/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import gsap from "gsap";

export interface SpriteConfig {
  imageUrl: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  framesPerRow?: number;
  maxFramesPerRow?: number;
  startFrame?: number;
  animations: {
    [key: string]: {
      row: number;
      startFrame?: number;
      frameCount: number;
      frameRate: number;
      loop?: boolean;
    };
  };
}

export class SpriteAnimator {
  private element: HTMLElement;
  private config: SpriteConfig;
  private currentFrame: number = 0;
  private currentAnimation: string | null = null;
  private timeline: gsap.core.Timeline | null = null;

  constructor(element: HTMLElement, config: SpriteConfig) {
    this.element = element;
    this.config = config;
    this.setupSprite();
  }

  private setupSprite() {
    // Set up the sprite element
    this.element.style.backgroundImage = `url(${this.config.imageUrl})`;
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.backgroundSize = "auto"; // Keep original size for pixel art
    this.element.style.width = `${this.config.frameWidth}px`;
    this.element.style.height = `${this.config.frameHeight}px`;
    this.element.style.imageRendering = "pixelated"; // Maintain pixel art quality
    this.element.style.imageRendering = "crisp-edges"; // Fallback for other browsers
    this.updateFrame(0, 0);
  }

  private updateFrame(row: number, frameInRow: number) {
    const x = frameInRow * this.config.frameWidth;
    const y = row * this.config.frameHeight;

    const offsetX = 11;
    const offsetY = 0;

    this.element.style.backgroundPosition = `-${x - offsetX}px -${y - offsetY}px`;
  }

  public playAnimation(animationName: string, onComplete?: () => void) {
    const animation = this.config.animations[animationName];
    if (!animation) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    // Stop current animation
    if (this.timeline) {
      this.timeline.kill();
    }

    this.currentAnimation = animationName;
    const frameDuration = 1 / animation.frameRate;
    const startFrame = this.config.startFrame ?? 0;

    this.timeline = gsap.timeline({
      repeat: animation.loop !== false ? -1 : 0,
      onComplete,
    });

    // Animate through frames in the specific row, starting from startFrame
    for (let frameIndex = 0; frameIndex <= animation.frameCount; frameIndex++) {
      this.timeline.call(
        () => this.updateFrame(animation.row, startFrame + frameIndex),
        [],
        frameIndex * frameDuration,
      );
    }
  }

  public stopAnimation() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.currentAnimation = null;
  }

  public getCurrentAnimation(): string | null {
    return this.currentAnimation;
  }
}

// React Hook for Sprite Animation
import { useEffect, useRef } from "react";

export const useSpriteAnimation = (config: SpriteConfig) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const animatorRef = useRef<SpriteAnimator | null>(null);

  useEffect(() => {
    if (elementRef.current && !animatorRef.current) {
      animatorRef.current = new SpriteAnimator(elementRef.current, config);
    }

    return () => {
      if (animatorRef.current) {
        animatorRef.current.stopAnimation();
      }
    };
  }, [config]);

  const playAnimation = (animationName: string, onComplete?: () => void) => {
    animatorRef.current?.playAnimation(animationName, onComplete);
  };

  const stopAnimation = () => {
    animatorRef.current?.stopAnimation();
  };

  return {
    elementRef,
    playAnimation,
    stopAnimation,
    getCurrentAnimation: () =>
      animatorRef.current?.getCurrentAnimation() ?? null,
  };
};
