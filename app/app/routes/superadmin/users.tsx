import { desc, eq } from "drizzle-orm";
import { data, Form } from "react-router";
import type { Route } from "./+types/users";
import { requireUser, db, updateUserRole, publicUserColumns } from "../../lib/auth.server";
import { users, roles, type Role } from "../../db/schema";
import { logAudit } from "../../lib/audit.server";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, CheckCircle2, AlertCircle } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const rows = await db.select(publicUserColumns).from(users).orderBy(desc(users.createdAt));
  return { users: rows };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["superadmin"]);
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  const role = String(form.get("role") ?? "") as Role;

  if (!userId || !roles.includes(role)) {
    return data({ error: "Invalid user or role." }, { status: 400 });
  }

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return data({ error: "User not found." }, { status: 404 });

  if (target.role === role) {
    return data({ unchanged: true as const, name: target.name, role });
  }

  await updateUserRole(userId, role);
  await logAudit({
    entityType: "user",
    entityId: userId,
    action: "role_change",
    actorUserId: actor.id,
    before: { role: target.role },
    after: { role },
  });

  return data({ success: true as const, name: target.name, role });
}

function UserRow({ user, availableRoles }: { user: any, availableRoles: readonly string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {user.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Form method="post" className="flex items-center gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="role" value={selectedRole} />
          
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-36 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 transition-all"
            >
              <span className="block truncate capitalize">{selectedRole}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </span>
            </button>

            {isOpen && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {availableRoles.map((r) => (
                  <li
                    key={r}
                    className={`relative cursor-default select-none py-2 pl-3 pr-9 ${
                      selectedRole === r ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setSelectedRole(r);
                      setIsOpen(false);
                    }}
                  >
                    <span className="block truncate capitalize">{r}</span>
                    {selectedRole === r && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            type="submit" 
            className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-colors"
          >
            Save
          </button>
        </Form>
      </td>
    </tr>
  );
}

function Toast({ actionData }: { actionData: Route.ComponentProps["actionData"] }) {
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData) {
      setMessage({ text: `${actionData.name} is now a ${actionData.role}.`, kind: "success" });
    } else if ("unchanged" in actionData) {
      setMessage({ text: `${actionData.name} is already a ${actionData.role}.`, kind: "success" });
    } else if ("error" in actionData) {
      setMessage({ text: actionData.error, kind: "error" });
    } else {
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), 3200);
    const clear = setTimeout(() => setMessage(null), 3500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hide);
      clearTimeout(clear);
    };
  }, [actionData]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-10 left-1/2 z-50 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-2xl ring-1 ring-gray-900/10 text-base font-medium text-gray-900 transition-all duration-300 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100 translate-y-0 -translate-x-1/2" : "opacity-0 translate-y-4 -translate-x-1/2"
      }`}
    >
      {message.kind === "success" ? (
        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
      ) : (
        <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
      )}
      <span className="capitalize">{message.text}</span>
    </div>
  );
}

export default function UsersList({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
      <Toast actionData={actionData} />
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Manage Users</h2>
        <p className="text-sm text-gray-500">Update roles for all registered users in the system.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loaderData.users.map((u) => (
              <UserRow key={u.id} user={u} availableRoles={roles} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
