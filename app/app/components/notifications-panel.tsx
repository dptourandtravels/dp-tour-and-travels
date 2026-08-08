import { Form } from "react-router";

type NotificationRow = { id: string; message: string; readAt: Date | null; createdAt: Date };

export function NotificationsPanel({ rows, formAction }: { rows: NotificationRow[]; formAction?: string }) {
  const unread = rows.filter((n) => !n.readAt).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-ink-muted-48">
          {unread > 0
            ? `${unread} unread`
            : `${rows.length} notification${rows.length === 1 ? "" : "s"}`}
        </p>
        {unread > 0 && (
          <Form method="post" action={formAction}>
            <button type="submit" className="text-sm text-action hover:underline">
              Mark all read
            </button>
          </Form>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10">
          <span className="material-symbols-outlined text-[32px] text-ink-muted-48 mb-2">
            notifications_off
          </span>
          <p className="text-sm font-medium text-ink">You&apos;re all caught up</p>
          <p className="text-xs text-ink-muted-48 mt-1">
            Updates about your payments and account will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((n) => (
            <li
              key={n.id}
              className="flex gap-3 rounded-lg -mx-2 px-2 py-3 border-b border-hairline last:border-b-0 hover:bg-black/[0.02] transition-colors"
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-action"}`}
              />
              <div className="min-w-0">
                <p className={n.readAt ? "text-sm text-ink-muted-80" : "text-sm font-medium text-ink"}>
                  {n.message}
                </p>
                <span className="block text-xs text-ink-muted-48 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
