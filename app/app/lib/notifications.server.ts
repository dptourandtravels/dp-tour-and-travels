import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "./auth.server";
import { notifications, type NotificationType } from "../db/schema";

export async function notifyUser(
  params: { userId: string; type: NotificationType; entityType: string; entityId: string; message: string },
  createdAt: Date = new Date(),
) {
  await db.insert(notifications).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    type: params.type,
    entityType: params.entityType,
    entityId: params.entityId,
    message: params.message,
    readAt: null,
    createdAt,
  });
}

export async function listNotificationsForUser(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
