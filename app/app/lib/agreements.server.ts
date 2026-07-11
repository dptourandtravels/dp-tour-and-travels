import { eq } from "drizzle-orm";
import { db } from "./auth.server";
import { cars, users, agreements } from "../db/schema";
import type { AgreementFields } from "./agreements";
import { notifyUser } from "./notifications.server";

export async function listCarsForAgreements() {
  return db
    .select({
      id: cars.id,
      make: cars.make,
      model: cars.model,
      registrationNumber: cars.registrationNumber,
      ownerName: users.name,
    })
    .from(cars)
    .innerJoin(users, eq(users.id, cars.clientId));
}

export async function buildAgreementFields(carId: string, rate: number, aadhaarUid: string) {
  const [row] = await db
    .select({ car: cars, client: users })
    .from(cars)
    .innerJoin(users, eq(users.id, cars.clientId))
    .where(eq(cars.id, carId))
    .limit(1);
  if (!row) return null;

  const fields: AgreementFields = {
    carDescription: `${row.car.make} ${row.car.model}`,
    registrationNumber: row.car.registrationNumber,
    ownerName: row.client.name,
    aadhaarUid,
    rate,
  };

  return { carId, partyUserId: row.client.id, fields };
}

export async function confirmAgreement(
  input: { carId: string; partyUserId: string; fields: AgreementFields },
  actorUserId: string,
) {
  const id = crypto.randomUUID();
  await db.insert(agreements).values({
    id,
    carId: input.carId,
    partyUserId: input.partyUserId,
    carDescription: input.fields.carDescription,
    registrationNumber: input.fields.registrationNumber,
    ownerName: input.fields.ownerName,
    aadhaarUid: input.fields.aadhaarUid,
    rate: input.fields.rate,
    issuedByUserId: actorUserId,
    createdAt: new Date(),
  });

  await notifyUser({
    userId: input.partyUserId,
    type: "agreement_issued",
    entityType: "agreement",
    entityId: id,
    message: `Your agreement for ${input.fields.carDescription} (${input.fields.registrationNumber}) has been issued.`,
  });

  return { id };
}
