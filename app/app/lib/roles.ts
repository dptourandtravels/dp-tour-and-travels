import type { Role } from "../db/schema";

export function dashboardPathForRole(role: Role) {
  // "user" (default self-signup) shares the client portal — same features, no separate landing.
  if (role === "user") return "/client";
  return `/${role}`;
}
