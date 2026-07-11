import { Form } from "react-router";

export function DashboardShell({
  title,
  name,
  email,
}: {
  title: string;
  name: string;
  email: string;
}) {
  return (
    <main className="max-w-2xl mx-auto pt-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Form method="post" action="/logout">
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </Form>
      </div>
      <p>
        Signed in as {name} ({email}).
      </p>
    </main>
  );
}
