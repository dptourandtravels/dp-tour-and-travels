import { desc, eq } from "drizzle-orm";
import { db, getOrCreateClient } from "./auth.server";
import { clientIntakeApplications, carRequirements } from "../db/schema";

export async function submitIntake(input: {
  carRequirementId: string;
  name: string;
  email: string;
  phone: string;
  carMake: string;
  carModel: string;
  message: string;
}) {
  const { user: client, password: clientPassword } = await getOrCreateClient(input.email, input.name);

  await db.insert(clientIntakeApplications).values({
    id: crypto.randomUUID(),
    carRequirementId: input.carRequirementId,
    clientUserId: client.id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    carMake: input.carMake.trim(),
    carModel: input.carModel.trim(),
    message: input.message.trim() || null,
    acceptedTermsAt: new Date(),
    createdAt: new Date(),
  });

  return { client, clientPassword };
}

export async function listIntakeApplications() {
  return db
    .select({ application: clientIntakeApplications, requirement: carRequirements })
    .from(clientIntakeApplications)
    .innerJoin(carRequirements, eq(carRequirements.id, clientIntakeApplications.carRequirementId))
    .orderBy(desc(clientIntakeApplications.createdAt));
}
