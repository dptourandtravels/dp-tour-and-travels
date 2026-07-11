import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password/:token", "routes/reset-password.tsx"),
  route("finance", "routes/finance.tsx"),
  route("client", "routes/client.tsx"),
  route("dealer", "routes/dealer.tsx"),
  route("superadmin", "routes/superadmin/layout.tsx", [
    index("routes/superadmin/dashboard.tsx"),
    route("users", "routes/superadmin/users.tsx"),
    route("users/new", "routes/superadmin/users.new.tsx"),
    route("users/bulk", "routes/superadmin/users.bulk.tsx"),
  ]),
] satisfies RouteConfig;
