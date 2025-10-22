import { Elysia } from "elysia";
import { listRoute } from "./_helpers";

/** Lookup tabloları salt-okunur listeler */
export const lookupsRoutes = () => {
  const lookups = new Elysia({ name: "routes:lookups" });
  listRoute(lookups, {
    path: "/user-statuses",
    table: "user_statuses",
    tag: "lookups",
  });
  listRoute(lookups, {
    path: "/task-statuses",
    table: "task_statuses",
    tag: "lookups",
  });
  listRoute(lookups, {
    path: "/idea-assignees",
    table: "idea_assignees",
    tag: "lookups",
  });
  return lookups;
};
