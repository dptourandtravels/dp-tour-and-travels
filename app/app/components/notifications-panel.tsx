import { Form } from "react-router";

type NotificationRow = { id: string; message: string; readAt: Date | null; createdAt: Date };

export function NotificationsPanel({ rows, formAction }: { rows: NotificationRow[]; formAction?: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-ink-muted-48">
          {rows.length} notification{rows.length === 1 ? "" : "s"}
        </p>
        <Form method="post" action={formAction}>
          <button type="submit" className="text-sm text-action hover:underline">
            Mark all read
          </button>
        </Form>
      </div>
      <ul className="flex flex-col">
        {rows.map((n) => (
          <li key={n.id} className="border-b border-hairline py-3 last:border-b-0">
            <p className={n.readAt ? "text-sm text-ink-muted-80" : "text-sm font-medium text-ink"}>{n.message}</p>
            <span className="block text-xs text-ink-muted-48 mt-1">{new Date(n.createdAt).toLocaleString()}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-ink-muted-48 py-3">No notifications yet.</li>}
      </ul>
    </div>
  );
}
