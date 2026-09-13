"use client";

import { useState, useEffect } from "react";

export interface FrontendImageItem {
  id: string;
  section: "hero" | "courses" | "testimonials" | "media";
  label: string;
  description: string;
  defaultUrl: string;
  aspectRatio: string;
}

export const DEFAULT_FRONTEND_IMAGES: Record<string, string> = {
  // Hero Section
  hero_main:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop",
  hero_badge_avatar:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop",

  // Courses
  course_1:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
  course_2:
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60",
  course_3:
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=60",
  course_4:
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=60",
  course_5:
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=60",
  course_6:
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=60",
  course_7:
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&auto=format&fit=crop&q=60",

  // Student Testimonials
  testimonial_1:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
  testimonial_2:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
  testimonial_3:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop",
  testimonial_4:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",

  // Media Section
  youtube_thumb:
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=675&fit=crop",
  instagram_1:
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&h=800&fit=crop",
  instagram_2:
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop",
  instagram_3:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop",
  instagram_4:
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=600&fit=crop",
};

export const FRONTEND_IMAGE_CATALOG: FrontendImageItem[] = [
  // Hero
  {
    id: "hero_main",
    section: "hero",
    label: "Hero Main Visual",
    description: "Primary clinical training showcase photo in the hero section",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.hero_main,
    aspectRatio: "4/3",
  },
  {
    id: "hero_badge_avatar",
    section: "hero",
    label: "Hero Mentor Badge",
    description: "Doctor / Mentor avatar in the floating 'Expert Faculty' pill",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.hero_badge_avatar,
    aspectRatio: "1/1",
  },

  // Courses
  {
    id: "course_1",
    section: "courses",
    label: "OSSSC Nursing Officer Coaching",
    description: "Card cover photo for OSSSC Nursing recruitment batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_1,
    aspectRatio: "16/11",
  },
  {
    id: "course_2",
    section: "courses",
    label: "AIIMS NORCET Coaching",
    description: "Card cover photo for AIIMS NORCET exam batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_2,
    aspectRatio: "16/11",
  },
  {
    id: "course_3",
    section: "courses",
    label: "ESIC Nursing Officer Coaching",
    description: "Card cover photo for ESIC recruitment batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_3,
    aspectRatio: "16/11",
  },
  {
    id: "course_4",
    section: "courses",
    label: "MNS Entrance Exam Prep",
    description: "Card cover photo for Military Nursing Service batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_4,
    aspectRatio: "16/11",
  },
  {
    id: "course_5",
    section: "courses",
    label: "RRB Railway Staff Nurse Prep",
    description: "Card cover photo for Railway Recruitment Board nursing batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_5,
    aspectRatio: "16/11",
  },
  {
    id: "course_6",
    section: "courses",
    label: "OJEE Nursing Entrance Prep",
    description: "Card cover photo for OJEE state entrance batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_6,
    aspectRatio: "16/11",
  },
  {
    id: "course_7",
    section: "courses",
    label: "Nursing Lecturer & Tutor Prep",
    description: "Card cover photo for teaching recruitments batch",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.course_7,
    aspectRatio: "16/11",
  },

  // Testimonials
  {
    id: "testimonial_1",
    section: "testimonials",
    label: "Riya Sahu (OSSSC Officer)",
    description: "Avatar photo for Riya Sahu's testimonial card",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.testimonial_1,
    aspectRatio: "1/1",
  },
  {
    id: "testimonial_2",
    section: "testimonials",
    label: "Amit Kumar Behera (AIIMS NORCET)",
    description: "Avatar photo for Amit Kumar's testimonial card",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.testimonial_2,
    aspectRatio: "1/1",
  },
  {
    id: "testimonial_3",
    section: "testimonials",
    label: "Sneha Das (ESIC Placement)",
    description: "Avatar photo for Sneha Das's testimonial card",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.testimonial_3,
    aspectRatio: "1/1",
  },
  {
    id: "testimonial_4",
    section: "testimonials",
    label: "Rajesh Panda (RRB Superintendent)",
    description: "Avatar photo for Rajesh Panda's testimonial card",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.testimonial_4,
    aspectRatio: "1/1",
  },

  // Media
  {
    id: "youtube_thumb",
    section: "media",
    label: "YouTube Video Preview",
    description: "Cover thumbnail behind the YouTube play button",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.youtube_thumb,
    aspectRatio: "16/9",
  },
  {
    id: "instagram_1",
    section: "media",
    label: "Instagram Gallery Photo 1",
    description: "First photo in the 2x2 campus life mosaic",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.instagram_1,
    aspectRatio: "1/1",
  },
  {
    id: "instagram_2",
    section: "media",
    label: "Instagram Gallery Photo 2",
    description: "Second photo in the 2x2 campus life mosaic",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.instagram_2,
    aspectRatio: "1/1",
  },
  {
    id: "instagram_3",
    section: "media",
    label: "Instagram Gallery Photo 3",
    description: "Third photo in the 2x2 campus life mosaic",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.instagram_3,
    aspectRatio: "1/1",
  },
  {
    id: "instagram_4",
    section: "media",
    label: "Instagram Gallery Photo 4",
    description: "Fourth photo in the 2x2 campus life mosaic",
    defaultUrl: DEFAULT_FRONTEND_IMAGES.instagram_4,
    aspectRatio: "1/1",
  },
];

const STORAGE_KEY = "aims_frontend_images";
const UPDATE_EVENT_NAME = "aims_frontend_images_updated";

/**
 * Retrieve current saved frontend images merged with defaults
 */
export function getSavedFrontendImages(): Record<string, string> {
  if (typeof window === "undefined") {
    return DEFAULT_FRONTEND_IMAGES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FRONTEND_IMAGES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FRONTEND_IMAGES, ...parsed };
  } catch {
    return DEFAULT_FRONTEND_IMAGES;
  }
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  );
}

/**
 * Save single or multiple images and notify all listeners
 */
export function saveFrontendImages(updates: Record<string, string>) {
  if (typeof window === "undefined") return;

  try {
    const current = getSavedFrontendImages();
    const sanitizedUpdates: Record<string, string> = {};

    for (const [key, val] of Object.entries(updates)) {
      if (isValidImageUrl(val)) {
        sanitizedUpdates[key] = val.trim();
      }
    }

    const updated = { ...current, ...sanitizedUpdates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error("Error saving frontend images:", err);
  }
}

/**
 * Reset all images to default values
 */
export function resetAllFrontendImages() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT_NAME, { detail: DEFAULT_FRONTEND_IMAGES })
    );
  } catch (err) {
    console.error("Error resetting frontend images:", err);
  }
}

/**
 * Reactive hook that listens for image updates across the site
 */
export function useFrontendImages() {
  const [images, setImages] = useState<Record<string, string>>(DEFAULT_FRONTEND_IMAGES);

  useEffect(() => {
    // Initial client sync
    setImages(getSavedFrontendImages());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Record<string, string>>;
      if (customEvent.detail) {
        setImages(customEvent.detail);
      } else {
        setImages(getSavedFrontendImages());
      }
    };

    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return images;
}

/**
 * Convenience hook for a single image with fallback
 */
export function useFrontendImage(key: string, fallback?: string): string {
  const images = useFrontendImages();
  return images[key] || fallback || DEFAULT_FRONTEND_IMAGES[key] || "";
}
