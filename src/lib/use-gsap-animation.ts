"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Safely register ScrollTrigger in browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks if user prefers reduced motion for accessibility
 */
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Hook to execute subtle GSAP animations with automatic context cleanup
 */
export function useGSAP(
  callback: (context: gsap.Context) => void,
  dependencies: any[] = []
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(callback, containerRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return containerRef;
}

/**
 * Helper to run smooth, subtle section entrance animations
 */
export function animateSectionEntrance(
  selector: string,
  options: {
    delay?: number;
    stagger?: number;
    y?: number;
    duration?: number;
    trigger?: string | Element;
  } = {}
) {
  if (prefersReducedMotion()) return;

  const {
    delay = 0,
    stagger = 0.08,
    y = 20,
    duration = 0.6,
    trigger,
  } = options;

  gsap.from(selector, {
    y,
    opacity: 0,
    duration,
    stagger,
    ease: "power2.out",
    delay,
    scrollTrigger: trigger
      ? {
          trigger,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      : undefined,
  });
}

/**
 * Helper to animate text elements smoothly on scroll
 */
export function animateScrollText(
  selector: string,
  options: {
    trigger?: string | Element;
    y?: number;
    stagger?: number;
    duration?: number;
  } = {}
) {
  if (prefersReducedMotion()) return;

  const {
    trigger,
    y = 30,
    stagger = 0.12,
    duration = 0.75,
  } = options;

  gsap.from(selector, {
    y,
    opacity: 0,
    duration,
    stagger,
    ease: "power3.out",
    scrollTrigger: {
      trigger: trigger || selector,
      start: "top 88%",
      toggleActions: "play none none none",
    },
  });
}
