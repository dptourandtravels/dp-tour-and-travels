import type { Role } from "../db/schema";

export type NavItem = { to: string; label: string; end?: boolean };
export type NavGroup = { label: string; items: NavItem[] };

const SUPERADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/superadmin", label: "Dashboard", end: true }],
  },
  {
    label: "Users",
    items: [
      { to: "/superadmin/users", label: "All users" },
      { to: "/superadmin/users/new", label: "Add user" },
      { to: "/superadmin/users/bulk", label: "Bulk import" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/superadmin/cars", label: "Cars & payments" },
      { to: "/agreements/new", label: "New agreement" },
      { to: "/notifications", label: "Notifications" },
    ],
  },
  {
    label: "Requests",
    items: [
      { to: "/superadmin/requirements", label: "Car requirements" },
      { to: "/superadmin/intake", label: "Intake" },
      { to: "/superadmin/dealer-applications", label: "Dealer applications" },
      { to: "/superadmin/dealer-stock-requests", label: "Dealer stock requests" },
    ],
  },
];

const FINANCE_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/finance", label: "Dashboard", end: true }],
  },
  {
    label: "Operations",
    items: [
      { to: "/superadmin/cars", label: "Cars & payments" },
      { to: "/agreements/new", label: "New agreement" },
      { to: "/notifications", label: "Notifications" },
    ],
  },
];

export function getNavGroups(role: Role): NavGroup[] {
  if (role === "superadmin") return SUPERADMIN_NAV;
  if (role === "finance") return FINANCE_NAV;
  return [];
}
