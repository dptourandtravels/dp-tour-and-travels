import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const roles = ["superadmin", "finance", "client", "dealer"] as const;
export type Role = (typeof roles)[number];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: roles }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
});

export const cars = sqliteTable("cars", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => users.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  receiptDate: integer("receipt_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const paymentStatuses = ["green", "red"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  carId: text("car_id")
    .notNull()
    .references(() => cars.id),
  amount: integer("amount").notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: paymentStatuses }).notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").references(() => users.id),
  beforeValue: text("before_value"),
  afterValue: text("after_value"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const notificationTypes = [
  "reminder_7day",
  "reminder_3day",
  "reminder_due",
  "payout_scheduled",
  "agreement_issued",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type", { enum: notificationTypes }).notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  message: text("message").notNull(),
  readAt: integer("read_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const agreements = sqliteTable("agreements", {
  id: text("id").primaryKey(),
  carId: text("car_id")
    .notNull()
    .references(() => cars.id),
  partyUserId: text("party_user_id")
    .notNull()
    .references(() => users.id),
  carDescription: text("car_description").notNull(),
  registrationNumber: text("registration_number").notNull(),
  ownerName: text("owner_name").notNull(),
  aadhaarUid: text("aadhaar_uid").notNull(),
  rate: integer("rate").notNull(),
  issuedByUserId: text("issued_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
