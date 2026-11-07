"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function ActivityTracker() {
  const lastActivityTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticatedRef = useRef<boolean>(false);

  useEffect(() => {
    const supabase = createClient();

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        isAuthenticatedRef.current = !!session?.user;
      } catch {
        isAuthenticatedRef.current = false;
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      isAuthenticatedRef.current = !!session?.user;
    });

    // Update last activity timestamp on user interaction
    const updateActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));

    // Send heartbeat ping if user is active & tab is visible
    const sendHeartbeat = async () => {
      if (!isAuthenticatedRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

      const idleDuration = Date.now() - lastActivityTimeRef.current;
      // If idle for more than 2 minutes, don't count inactive idle time
      if (idleDuration > 120_000) return;

      try {
        await fetch("/api/track/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seconds: 60 }),
          keepalive: true,
        });
      } catch {
        // noop
      }
    };

    // First ping after 15 seconds to immediately register "active rn / DAU"
    const initialTimeout = setTimeout(sendHeartbeat, 15_000);

    // Regular interval: every 60 seconds
    timerRef.current = setInterval(sendHeartbeat, 60_000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(initialTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, updateActivity));
    };
  }, []);

  return null;
}

