import { desc, eq } from "drizzle-orm";
import { db } from "./auth.server";
import { carRequirements } from "../db/schema";

export async function listOpenCarRequirements() {
  return db.select().from(carRequirements).where(eq(carRequirements.status, "open")).orderBy(desc(carRequirements.createdAt));
}

export async function listAllCarRequirements() {
  return db.select().from(carRequirements).orderBy(desc(carRequirements.createdAt));
}

export async function getCarRequirement(id: string) {
  const [row] = await db.select().from(carRequirements).where(eq(carRequirements.id, id)).limit(1);
  return row ?? null;
}

export async function createCarRequirement(
  title: string,
  description: string,
  color: string,
  quantity: number | null,
) {
  await db.insert(carRequirements).values({
    id: crypto.randomUUID(),
    title,
    description: description || null,
    color: color || null,
    quantity,
    status: "open",
    createdAt: new Date(),
  });
}

export async function closeCarRequirement(id: string) {
  await db.update(carRequirements).set({ status: "closed", closedAt: new Date() }).where(eq(carRequirements.id, id));
}
