// Pure, no Cloudflare imports — runnable and testable under plain Node too.
export const PAYOUT_DAYS = 70;

export function computeDueDate(receiptDate: Date): Date {
  return new Date(receiptDate.getTime() + PAYOUT_DAYS * 24 * 60 * 60 * 1000);
}

// ponytail: due-date-crossing (green->red) is recomputed when the cars list loads, not on a
// schedule. Fine while someone checks the page daily; swap for a Cron Trigger job in Phase 3.
export function computeStatus(
  payment: { paidAt: Date | null; dueDate: Date },
  now: Date = new Date(),
): "green" | "red" {
  if (payment.paidAt) return "green";
  return payment.dueDate.getTime() < now.getTime() ? "red" : "green";
}
