import { desc, eq } from "drizzle-orm";
import { db } from "./auth.server";
import { cars, users, dealerStockRequests } from "../db/schema";
import { notifyUser } from "./notifications.server";

export async function listStockOverview() {
  return db
    .select({
      id: cars.id,
      make: cars.make,
      model: cars.model,
      registrationNumber: cars.registrationNumber,
      dealerId: cars.dealerId,
      leaseEndDate: cars.leaseEndDate,
    })
    .from(cars)
    .orderBy(desc(cars.createdAt));
}

export async function listAssignedCarsForDealer(dealerId: string) {
  return db
    .select({ car: cars, client: users })
    .from(cars)
    .innerJoin(users, eq(users.id, cars.clientId))
    .where(eq(cars.dealerId, dealerId))
    .orderBy(desc(cars.createdAt));
}

export async function submitStockRequest(input: { dealerId: string; carMake: string; carModel: string; message: string }) {
  await db.insert(dealerStockRequests).values({
    id: crypto.randomUUID(),
    dealerId: input.dealerId,
    carMake: input.carMake.trim(),
    carModel: input.carModel.trim(),
    message: input.message.trim() || null,
    status: "open",
    createdAt: new Date(),
  });
}

export async function listStockRequestsForDealer(dealerId: string) {
  return db
    .select()
    .from(dealerStockRequests)
    .where(eq(dealerStockRequests.dealerId, dealerId))
    .orderBy(desc(dealerStockRequests.createdAt));
}

export async function listAllStockRequests() {
  return db
    .select({ request: dealerStockRequests, dealer: users })
    .from(dealerStockRequests)
    .innerJoin(users, eq(users.id, dealerStockRequests.dealerId))
    .orderBy(desc(dealerStockRequests.createdAt));
}

export async function assignCarToDealer(input: { carId: string; dealerId: string; leaseStartDate: Date; leaseEndDate: Date }) {
  await db
    .update(cars)
    .set({ dealerId: input.dealerId, leaseStartDate: input.leaseStartDate, leaseEndDate: input.leaseEndDate })
    .where(eq(cars.id, input.carId));

  const [car] = await db.select().from(cars).where(eq(cars.id, input.carId)).limit(1);
  if (car) {
    await notifyUser({
      userId: input.dealerId,
      type: "car_assigned",
      entityType: "car",
      entityId: input.carId,
      message: `${car.make} ${car.model} (${car.registrationNumber}) has been assigned to you, leased ${input.leaseStartDate.toLocaleDateString()} - ${input.leaseEndDate.toLocaleDateString()}.`,
    });
  }
}
