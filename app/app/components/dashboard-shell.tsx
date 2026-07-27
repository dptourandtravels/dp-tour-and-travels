import { Form, Link } from "react-router";

export function DashboardShell({
  title,
  name,
  email,
  children,
}: {
  title: string;
  name: string;
  email: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-parchment font-sans">
      <main className="max-w-2xl mx-auto pt-16 px-4 pb-16">
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-hairline">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{title}</h1>
            <p className="text-sm text-ink-muted-80 mt-1">
              Signed in as {name} ({email})
            </p>
          </div>
          <Form method="post" action="/logout">
            <button type="submit" className="text-sm text-ink-muted-80 hover:text-action transition-colors">
              Sign out
            </button>
          </Form>
        </div>
        <Link to="/notifications" className="inline-block mb-6 text-sm text-action hover:underline">
          Notifications
        </Link>
        {children}
      </main>
    </div>
  );
}
