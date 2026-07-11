import { desc } from "drizzle-orm";
import { db } from "./auth.server";
import { dealerApplications } from "../db/schema";

export async function submitDealerApplication(input: { name: string; email: string; phone: string; message: string }) {
  await db.insert(dealerApplications).values({
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    message: input.message.trim() || null,
    createdAt: new Date(),
  });
}

export async function listDealerApplications() {
  return db.select().from(dealerApplications).orderBy(desc(dealerApplications.createdAt));
}
