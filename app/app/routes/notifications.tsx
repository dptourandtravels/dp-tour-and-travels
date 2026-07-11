import { data, Form } from "react-router";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Route } from "./+types/notifications";
import { requireUser, db } from "../lib/auth.server";
import { notifications } from "../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt));
  return { rows };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  return data({ success: true as const });
}

export default function Notifications({ loaderData }: Route.ComponentProps) {
  return (
    <main className="max-w-xl mx-auto pt-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Form method="post">
          <button type="submit" className="text-sm underline">
            Mark all read
          </button>
        </Form>
      </div>
      <ul className="flex flex-col gap-3">
        {loaderData.rows.map((n) => (
          <li key={n.id} className={n.readAt ? "text-gray-500" : "font-semibold"}>
            {n.message}
            <span className="block text-xs font-normal text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
        {loaderData.rows.length === 0 && <li className="text-gray-500">No notifications yet.</li>}
      </ul>
    </main>
  );
}
