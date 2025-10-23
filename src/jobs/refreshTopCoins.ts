import { CoinGeckoService } from "../services/coinGecko.service";

export const refreshTopCoinsJob = async () => {
  try {
    console.log("🔄 Refreshing top 10 coin prices...");
    await CoinGeckoService.fetchAndStoreTopCoins();
  } catch (err: any) {
    console.error("Error refreshing top coins:", err.message);
  }
};