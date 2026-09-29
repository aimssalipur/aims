/**
 * In-place data refresh event dispatcher and listener.
 * Allows components across role dashboards to refresh their data without reloading the browser.
 */

export function triggerDataRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aims:refresh-data", { detail: { timestamp: Date.now() } }));
  }
}

export function subscribeToDataRefresh(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    try {
      callback();
    } catch (e) {
      console.error("[aims:refresh-data] Handler error:", e);
    }
  };

  window.addEventListener("aims:refresh-data", handler);
  return () => {
    window.removeEventListener("aims:refresh-data", handler);
  };
}
