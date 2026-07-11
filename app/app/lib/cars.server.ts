import { desc, eq } from "drizzle-orm";
import { db, getOrCreateClient } from "./auth.server";
import { cars, payments, users, auditLog } from "../db/schema";
import { computeDueDate, computeStatus } from "./payments";
import { notifyUser } from "./notifications.server";

async function logAudit(params: {
  entityId: string;
  action: string;
  actorUserId: string | null;
  before?: unknown;
  after?: unknown;
}) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    entityType: "payment",
    entityId: params.entityId,
    action: params.action,
    actorUserId: params.actorUserId,
    beforeValue: params.before === undefined ? null : JSON.stringify(params.before),
    afterValue: params.after === undefined ? null : JSON.stringify(params.after),
    createdAt: new Date(),
  });
}

export async function createCarWithPayment(
  input: {
    clientEmail: string;
    clientName: string;
    make: string;
    model: string;
    registrationNumber: string;
    receiptDate: Date;
    amount: number;
  },
  actorUserId: string,
) {
  const { user: client, password: clientPassword } = await getOrCreateClient(input.clientEmail, input.clientName);

  const carId = crypto.randomUUID();
  await db.insert(cars).values({
    id: carId,
    clientId: client.id,
    make: input.make,
    model: input.model,
    registrationNumber: input.registrationNumber,
    receiptDate: input.receiptDate,
    createdAt: new Date(),
  });

  const paymentId = crypto.randomUUID();
  const dueDate = computeDueDate(input.receiptDate);
  await db.insert(payments).values({
    id: paymentId,
    carId,
    amount: input.amount,
    dueDate,
    status: "green",
    paidAt: null,
    createdAt: new Date(),
  });

  await logAudit({
    entityId: paymentId,
    action: "create",
    actorUserId,
    after: { amount: input.amount, dueDate: dueDate.toISOString(), status: "green" },
  });

  await notifyUser({
    userId: client.id,
    type: "payout_scheduled",
    entityType: "payment",
    entityId: paymentId,
    message: `Your payout of ₹${input.amount} for ${input.make} ${input.model} (${input.registrationNumber}) is scheduled for ${dueDate.toLocaleDateString()}.`,
  });

  return { client, clientPassword };
}

export async function listCarsWithPayments() {
  const rows = await db
    .select({ car: cars, payment: payments, client: users })
    .from(cars)
    .innerJoin(payments, eq(payments.carId, cars.id))
    .innerJoin(users, eq(users.id, cars.clientId))
    .orderBy(desc(cars.createdAt));

  const now = new Date();
  for (const row of rows) {
    const freshStatus = computeStatus(row.payment, now);
    if (freshStatus !== row.payment.status) {
      await db.update(payments).set({ status: freshStatus }).where(eq(payments.id, row.payment.id));
      await logAudit({
        entityId: row.payment.id,
        action: "status_change",
        actorUserId: null, // time-driven, no human actor
        before: { status: row.payment.status },
        after: { status: freshStatus },
      });
      row.payment.status = freshStatus;
    }
  }

  return rows;
}

export async function markPaymentPaid(paymentId: string, actorUserId: string) {
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment) return { error: "Payment not found." as const };
  if (payment.paidAt) return { error: "Already marked paid." as const };

  const previousStatus = payment.status;
  await db.update(payments).set({ paidAt: new Date(), status: "green" }).where(eq(payments.id, paymentId));

  await logAudit({
    entityId: paymentId,
    action: previousStatus === "red" ? "status_change" : "mark_paid",
    actorUserId,
    before: { status: previousStatus, paidAt: null },
    after: { status: "green", paidAt: true },
  });

  return { success: true as const };
}

export async function editPaymentAmount(paymentId: string, newAmount: number, actorUserId: string) {
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment) return { error: "Payment not found." as const };

  await db.update(payments).set({ amount: newAmount }).where(eq(payments.id, paymentId));
  await logAudit({
    entityId: paymentId,
    action: "amount_edit",
    actorUserId,
    before: { amount: payment.amount },
    after: { amount: newAmount },
  });

  return { success: true as const };
}
