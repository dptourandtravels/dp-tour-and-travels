import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("get-started", "routes/get-started.tsx"),
  route("logout", "routes/logout.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password/:token", "routes/reset-password.tsx"),
  route("finance", "routes/finance.tsx"),
  route("client", "routes/client.tsx"),
  route("client/documents/:docType", "routes/client.documents.$docType.tsx"),
  route("dealer", "routes/dealer.tsx"),
  route("superadmin", "routes/superadmin/layout.tsx", [
    index("routes/superadmin/dashboard.tsx"),
    route("users", "routes/superadmin/users.tsx"),
    route("users/new", "routes/superadmin/users.new.tsx"),
    route("users/bulk", "routes/superadmin/users.bulk.tsx"),
    route("requirements", "routes/superadmin/requirements.tsx"),
    route("intake", "routes/superadmin/intake.tsx"),
    route("dealer-applications", "routes/superadmin/dealer-applications.tsx"),
    route("dealer-stock-requests", "routes/superadmin/dealer-stock-requests.tsx"),
  ]),
  route("superadmin/cars", "routes/cars/layout.tsx", [
    index("routes/cars/list.tsx"),
    route("new", "routes/cars/new.tsx"),
  ]),
  route("notifications", "routes/notifications.tsx"),
  route("agreements/new", "routes/agreements.new.tsx"),
  route("agreements/:id/download", "routes/agreements.$id.download.tsx"),
  route("terms", "routes/terms.tsx"),
  route("requirements/:id/apply", "routes/requirements.$id.apply.tsx"),
  route("dealers/apply", "routes/dealers.apply.tsx"),
] satisfies RouteConfig;
