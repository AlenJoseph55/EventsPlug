/**
 * Formats an event date string into a highly readable user format.
 * E.g., "2026-06-15" -> "Mon, Jun 15, 2026"
 * E.g., "2026-06-15T18:00" -> "Mon, Jun 15, 2026, 06:00 PM"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    // If it's a simple YYYY-MM-DD date format (pure date from input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      // month is 0-indexed in JavaScript Date
      const d = new Date(Date.UTC(year, month - 1, day));
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }

    // Check if there is a time component
    const hasTime = dateStr.includes("T") || dateStr.includes(":") || dateStr.includes(" ");
    if (hasTime) {
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
