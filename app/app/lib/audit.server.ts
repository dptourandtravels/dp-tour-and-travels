import { db } from "./auth.server";
import { auditLog } from "../db/schema";

export async function logAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  actorUserId: string | null;
  before?: unknown;
  after?: unknown;
}) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    actorUserId: params.actorUserId,
    beforeValue: params.before === undefined ? null : JSON.stringify(params.before),
    afterValue: params.after === undefined ? null : JSON.stringify(params.after),
    createdAt: new Date(),
  });
}
