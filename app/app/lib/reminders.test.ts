import { test } from "node:test";
import assert from "node:assert/strict";
import { daysUntilDue, reminderTypeForDaysUntilDue } from "./reminders.ts";

test("daysUntilDue counts calendar days, ignoring time-of-day", () => {
  const now = new Date("2026-01-01T23:00:00Z");
  const due = new Date("2026-01-04T01:00:00Z");
  assert.equal(daysUntilDue(now, due), 3);
});

test("reminderTypeForDaysUntilDue maps the three thresholds", () => {
  assert.equal(reminderTypeForDaysUntilDue(7), "reminder_7day");
  assert.equal(reminderTypeForDaysUntilDue(3), "reminder_3day");
  assert.equal(reminderTypeForDaysUntilDue(0), "reminder_due");
});

test("reminderTypeForDaysUntilDue is null off-threshold", () => {
  assert.equal(reminderTypeForDaysUntilDue(6), null);
  assert.equal(reminderTypeForDaysUntilDue(-1), null);
});
