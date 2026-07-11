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
