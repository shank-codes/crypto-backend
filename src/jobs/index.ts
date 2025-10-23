import cron from "node-cron";
import { refreshTopCoinsJob } from "./refreshTopCoins";
import { updateHistoricalPricesJob } from "./refreshHistoricalPrices";

const ENV = process.env.NODE_ENV || "development";

if (ENV === "production") {
  console.log("⚡ Running crypto data jobs...");

  // Run every 1 minute
  cron.schedule("* * * * *", refreshTopCoinsJob);

  // Run daily at 1:00 AM
  cron.schedule("0 1 * * *", updateHistoricalPricesJob);
} else {
  console.log(
    "⚠️ Jobs not started: ENV is not 'production'. Current ENV =",
    ENV
  );
}
