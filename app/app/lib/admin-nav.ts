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
      { to: "/cars", label: "Cars & payments" },
      { to: "/agreements/new", label: "New agreement" },
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
      { to: "/cars", label: "Cars & payments" },
      { to: "/agreements/new", label: "New agreement" },
    ],
  },
];

const CLIENT_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/client", label: "Dashboard", end: true },
      { to: "/client/your-cars", label: "Your Cars" },
      { to: "/client/documents", label: "Documents" },
      { to: "/client/agreements", label: "Agreements" },
    ],
  },
];

export function getNavGroups(role: Role): NavGroup[] {
  if (role === "superadmin") return SUPERADMIN_NAV;
  if (role === "finance") return FINANCE_NAV;
  if (role === "client") return CLIENT_NAV;
  return [];
}
