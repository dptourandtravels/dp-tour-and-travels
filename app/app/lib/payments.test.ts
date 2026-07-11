import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDueDate, computeStatus, PAYOUT_DAYS } from "./payments.ts";

test("computeDueDate adds PAYOUT_DAYS", () => {
  const receipt = new Date("2026-01-01T00:00:00Z");
  const due = computeDueDate(receipt);
  assert.equal(due.getTime() - receipt.getTime(), PAYOUT_DAYS * 24 * 60 * 60 * 1000);
});

test("computeStatus: green when unpaid and not yet due", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const dueDate = new Date("2026-02-01T00:00:00Z");
  assert.equal(computeStatus({ paidAt: null, dueDate }, now), "green");
});

test("computeStatus: red when unpaid and overdue", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const dueDate = new Date("2026-02-01T00:00:00Z");
  assert.equal(computeStatus({ paidAt: null, dueDate }, now), "red");
});

test("computeStatus: green once paid, even if overdue", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const dueDate = new Date("2026-02-01T00:00:00Z");
  const paidAt = new Date("2026-02-15T00:00:00Z");
  assert.equal(computeStatus({ paidAt, dueDate }, now), "green");
});
