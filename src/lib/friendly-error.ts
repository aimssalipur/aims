/**
 * Formats system, database, and network errors into clear, friendly, client-understandable messages.
 */
export function getFriendlyErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!err) return fallback;

  let rawMessage = "";
  if (typeof err === "string") {
    rawMessage = err;
  } else if (err instanceof Error) {
    rawMessage = err.message;
  } else if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, any>;
    rawMessage = obj.error || obj.message || obj.details || obj.msg || "";
  }

  if (!rawMessage) return fallback;

  const lower = rawMessage.toLowerCase();

  // 1. Network / connectivity errors
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout")
  ) {
    return "Network connection issue. Please check your internet connection and try again.";
  }

  // 2. Server HTML / 503 / 502 / crash responses
  if (
    lower.includes("<!doctype") ||
    lower.includes("syntaxerror: unexpected token '<'") ||
    lower.includes("unexpected token '<'") ||
    lower.includes("503") ||
    lower.includes("service unavailable") ||
    lower.includes("bad gateway")
  ) {
    return "The server is temporarily busy or updating. Please wait a few seconds and try again.";
  }

  // 3. Duplicate prevention / Rapid clicks
  if (
    lower.includes("just recorded") ||
    lower.includes("duplicate") ||
    lower.includes("already being processed") ||
    lower.includes("unique constraint") ||
    lower.includes("duplicate key")
  ) {
    if (lower.includes("transaction")) {
      return "A matching transaction was already logged a few seconds ago. To prevent accidental duplicates, please wait a moment.";
    }
    if (lower.includes("fee") || lower.includes("payment")) {
      return "A matching fee payment was already recorded a few moments ago. Please check the ledger before submitting again.";
    }
    return "This record already exists in the system or was just submitted.";
  }

  // 4. Authentication & Credentials
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Please verify your credentials.";
  }
  if (lower.includes("user already registered") || lower.includes("email already in use")) {
    return "An account with this email address already exists. Please log in instead.";
  }
  if (lower.includes("jwt expired") || lower.includes("session expired") || lower.includes("auth session missing")) {
    return "Your session has expired. Please log in again to continue.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email address has not been confirmed yet.";
  }

  // 5. Permissions / RLS
  if (
    lower.includes("row-level security") ||
    lower.includes("permission denied") ||
    lower.includes("forbidden") ||
    lower.includes("not authorized") ||
    lower.includes("unauthorized")
  ) {
    return "You do not have permission to perform this action. Please verify your role.";
  }

  // 6. Database raw tech jargon cleanup
  if (lower.includes("postgres") || lower.includes("supabase") || lower.includes("pgrst") || lower.includes("relation")) {
    return "Unable to save data due to a database sync issue. Please refresh and try again.";
  }

  // If the message is reasonably short and doesn't look like code/stacktrace, display it
  if (rawMessage.length < 160 && !rawMessage.includes("at ") && !rawMessage.includes("\n")) {
    return rawMessage;
  }

  return fallback;
}
