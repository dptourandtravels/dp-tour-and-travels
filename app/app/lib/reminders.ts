// Pure, no Cloudflare imports.
export type ReminderType = "reminder_7day" | "reminder_3day" | "reminder_due";

function startOfUtcDay(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function daysUntilDue(now: Date, dueDate: Date): number {
  return Math.round((startOfUtcDay(dueDate) - startOfUtcDay(now)) / (24 * 60 * 60 * 1000));
}

export function reminderTypeForDaysUntilDue(days: number): ReminderType | null {
  if (days === 7) return "reminder_7day";
  if (days === 3) return "reminder_3day";
  if (days === 0) return "reminder_due";
  return null;
}
