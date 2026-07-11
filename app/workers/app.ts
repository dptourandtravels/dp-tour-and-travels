import { createRequestHandler } from "react-router";
import { runDailyReminders } from "../app/lib/reminders.server";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    return requestHandler(request);
  },
  async scheduled() {
    await runDailyReminders();
  },
} satisfies ExportedHandler<Env>;
