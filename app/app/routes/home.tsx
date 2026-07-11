import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "DP Tour and Travels" }, { name: "description", content: "DP Tour and Travels" }];
}

export default function Home() {
  return (
    <main className="max-w-sm mx-auto pt-24 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-6">DP Tour and Travels</h1>
      <a href="/login" className="underline">
        Sign in
      </a>
    </main>
  );
}
