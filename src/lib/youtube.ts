/**
 * YouTube Utility Helper
 * Securely extracts YouTube Video/Stream IDs from multiple URL variations or raw IDs.
 */

export function extractYouTubeId(urlOrId: string | null | undefined): string {
  if (!urlOrId) return "";
  const str = urlOrId.trim();
  if (!str) return "";

  // Direct 11-character ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Covers watch?v=, /embed/, /v/, /live/, and youtu.be/
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);

  return match && match[1] ? match[1] : "";
}

export function isValidYouTubeSource(urlOrId: string | null | undefined): boolean {
  return !!extractYouTubeId(urlOrId);
}

