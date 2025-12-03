import { query } from "@/db";
import { mapRows } from "@/utils";
import Elysia from "elysia";

export const cityRoutes = () => {
  return new Elysia({ name: "routes:cities" }).get(
    "/cities",
    async () => {
      const res = await query(`
    SELECT id, name
    FROM cities
    ORDER BY name ASC
  `);

      return mapRows(res.rows);
    },
    {
      detail: {
        summary: "List all cities",
        tags: ["cities"],
      },
    }
  );
};
