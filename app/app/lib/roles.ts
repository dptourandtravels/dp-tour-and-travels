import type { Role } from "../db/schema";

export function dashboardPathForRole(role: Role) {
  return `/${role}`;
}
