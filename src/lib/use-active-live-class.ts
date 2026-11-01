"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToDataRefresh } from "@/lib/refresh-event";

export interface ActiveLiveClass {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
  scheduled_start: string;
  scheduled_end: string;
}

export function useActiveLiveClass(role?: string) {
  const [activeClass, setActiveClass] = useState<ActiveLiveClass | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchActiveClass = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/live-classes/active");
      if (res.ok) {
        const data = await res.json();
        setActiveClass(data.activeClass || null);
      }
    } catch {
      // quiet fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveClass();

    // Check periodically every 30 seconds so live classes show up without reloading
    const interval = setInterval(fetchActiveClass, 30000);

    // Also refetch when manual refresh is clicked
    const unsubscribe = subscribeToDataRefresh(() => {
      fetchActiveClass();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchActiveClass]);

  return { activeClass, loading, refetch: fetchActiveClass };
}

