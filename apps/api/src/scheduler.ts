import { query } from "@/db";
import * as cron from "node-cron";

export async function updateTechTalksStatus() {
  try {
    await query(
      `UPDATE techtalks
       SET status = FALSE
       WHERE status = TRUE
       AND date < NOW()
       AND deleted_at IS NULL`,
    );

    await query(
      `UPDATE techtalks
       SET status = FALSE
       WHERE status = TRUE
       AND video_url IS NOT NULL
       AND video_url != ''
       AND deleted_at IS NULL`,
    );

    console.log(
      `[${new Date().toISOString()}] TechTalks status updated successfully`,
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error updating TechTalks status:`,
      error,
    );
  }
}

export function initializeSchedulers() {
  const cronPattern = "0 3 * * *";

  try {
    cron.schedule(cronPattern, () => {
      console.log(
        `[${new Date().toISOString()}] Running TechTalks status scheduler...`,
      );
      updateTechTalksStatus();
    });

    console.log("✓ Schedulers initialized successfully");
    console.log(
      `  - TechTalks status update: Every day at 03:00 (${cronPattern})`,
    );
  } catch (error) {
    console.error("Failed to initialize schedulers:", error);
    console.warn(
      "⚠ Schedulers disabled. Install node-cron: npm install node-cron",
    );
  }
}
