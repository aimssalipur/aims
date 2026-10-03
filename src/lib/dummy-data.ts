import type { Course, Announcement, Profile, Enrollment } from "@/lib/types";

// Purged fake data - All data is fetched live from Supabase / DB
export const dummyInstructors: Profile[] = [];

export const dummyCourses: Course[] = [];

export const dummyAnnouncements: Announcement[] = [];

export const dummyTestimonials: any[] = [];

export const dummyStudents: Profile[] = [];

export const dummyEnrollments: Enrollment[] = [];

export const dummyDeadlines: any[] = [];

export const instagramImages = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&h=500&fit=crop",
];

export const monthlyEnrollments: { month: string; enrollments: number }[] = [];
export const dailyActiveUsers: { day: string; students: number; instructors: number; admin: number }[] = [];
export const courseCompletionRates: { name: string; value: number; color?: string }[] = [];

