import { and, eq, isNull } from "drizzle-orm";
import { db } from "./auth.server";
import { cars, payments, users, notifications } from "../db/schema";
import { daysUntilDue, reminderTypeForDaysUntilDue, type ReminderType } from "./reminders";
import { notifyUser } from "./notifications.server";

async function alreadySent(type: ReminderType, entityId: string) {
  const [existing] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.type, type), eq(notifications.entityType, "payment"), eq(notifications.entityId, entityId)))
    .limit(1);
  return Boolean(existing);
}

// ponytail: only `payments` (client payouts) is scanned — dealer_collections doesn't exist
// until Phase 7. Wire the same threshold logic there once that table lands.
export async function runDailyReminders(now: Date = new Date()) {
  const unpaid = await db
    .select({ payment: payments, car: cars })
    .from(payments)
    .innerJoin(cars, eq(cars.id, payments.carId))
    .where(isNull(payments.paidAt));

  const financeUsers = await db.select().from(users).where(eq(users.role, "finance"));

  let remindersCreated = 0;
  for (const { payment, car } of unpaid) {
    const type = reminderTypeForDaysUntilDue(daysUntilDue(now, payment.dueDate));
    if (!type) continue;
    if (await alreadySent(type, payment.id)) continue;

    const label = { reminder_7day: "in 7 days", reminder_3day: "in 3 days", reminder_due: "today" }[type];
    const message = `Payout of ₹${payment.amount} for ${car.make} ${car.model} (${car.registrationNumber}) is due ${label}.`;

    for (const finance of financeUsers) {
      await notifyUser({ userId: finance.id, type, entityType: "payment", entityId: payment.id, message }, now);
    }
    remindersCreated++;
  }

  return { remindersCreated };
}
