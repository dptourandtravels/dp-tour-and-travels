import { useState, type ReactNode } from "react";
import { Form, Link, NavLink } from "react-router";
import type { NavGroup } from "../lib/admin-nav";

function NavGroups({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-label-sm text-ink-muted-48 uppercase tracking-wide px-3 mb-2">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? false}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-action/10 text-action font-medium"
                      : "text-ink-muted-80 hover:bg-black/[0.03] hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function SidebarShell({
  user,
  navGroups,
  children,
}: {
  user: { name: string; email: string };
  navGroups: NavGroup[];
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-canvas-parchment font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-hairline bg-surface-pearl px-4 py-6">
        <Link to="/" className="flex items-center gap-2 text-ink px-3 mb-8">
          <img src="/dp-logo-mark.png" alt="" className="w-7 h-7 object-contain shrink-0" />
          <span className="text-tagline whitespace-nowrap">DP Tour &amp; Travels</span>
        </Link>

        <div className="flex-1 overflow-y-auto">
          <NavGroups groups={navGroups} />
        </div>

        <div className="border-t border-hairline pt-4 mt-4 px-3">
          <p className="text-sm text-ink truncate">{user.name}</p>
          <p className="text-xs text-ink-muted-48 truncate mb-3">{user.email}</p>
          <Form method="post" action="/logout">
            <button type="submit" className="text-sm text-ink-muted-80 hover:text-action transition-colors">
              Sign out
            </button>
          </Form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 px-4 bg-[rgba(245,245,247,0.8)] backdrop-blur-xl border-b border-black/[0.08]">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <img src="/dp-logo-mark.png" alt="" className="w-6 h-6 object-contain shrink-0" />
          <span className="text-tagline text-base whitespace-nowrap">DP Tour &amp; Travels</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-hairline text-ink"
        >
          <span className="sr-only">Open menu</span>
          <div className="flex flex-col gap-[3px]">
            <span className="block w-4 h-[1.5px] bg-ink" />
            <span className="block w-4 h-[1.5px] bg-ink" />
            <span className="block w-4 h-[1.5px] bg-ink" />
          </div>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-surface-pearl border-r border-hairline px-4 py-6 flex flex-col">
            <div className="flex items-center justify-between px-3 mb-8">
              <span className="text-tagline">Menu</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted-80"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavGroups groups={navGroups} onNavigate={() => setMobileNavOpen(false)} />
            </div>
            <div className="border-t border-hairline pt-4 mt-4 px-3">
              <p className="text-sm text-ink truncate">{user.name}</p>
              <p className="text-xs text-ink-muted-48 truncate mb-3">{user.email}</p>
              <Form method="post" action="/logout">
                <button type="submit" className="text-sm text-ink-muted-80 hover:text-action transition-colors">
                  Sign out
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 px-4 md:px-10 py-8 md:py-10 pt-20 md:pt-10">{children}</main>
    </div>
  );
}
