/**
 * Utility helpers for formatting user activity timestamps and duration
 */

export function formatLastSeen(lastSeenAt?: string | null): {
  text: string;
  isOnline: boolean;
  colorClass: string;
} {
  if (!lastSeenAt) {
    return { text: "Never active", isOnline: false, colorClass: "text-slate-400" };
  }

  const now = Date.now();
  const seen = new Date(lastSeenAt).getTime();
  const diffSec = Math.max(0, Math.floor((now - seen) / 1000));

  // Within 5 minutes is considered "Online Now"
  if (diffSec < 300) {
    return { text: "Online now", isOnline: true, colorClass: "text-emerald-600 font-bold" };
  }

  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return { text: `${mins}m ago`, isOnline: false, colorClass: "text-slate-600" };
  }

  if (diffSec < 86400) {
    const hrs = Math.floor(diffSec / 3600);
    return { text: `${hrs}h ago`, isOnline: false, colorClass: "text-slate-500" };
  }

  if (diffSec < 172800) {
    return { text: "Yesterday", isOnline: false, colorClass: "text-slate-500" };
  }

  const days = Math.floor(diffSec / 86400);
  if (days < 30) {
    return { text: `${days}d ago`, isOnline: false, colorClass: "text-slate-400" };
  }

  return {
    text: new Date(lastSeenAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    isOnline: false,
    colorClass: "text-slate-400",
  };
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "0 mins";

  const totalMins = Math.floor(seconds / 60);
  if (totalMins < 60) {
    return `${Math.max(1, totalMins)} min${totalMins > 1 ? "s" : ""}`;
  }

  const hrs = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;

  if (remainingMins === 0) {
    return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  }

  return `${hrs}h ${remainingMins}m`;
}

