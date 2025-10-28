import { CoinGeckoService } from "../services/coinGecko.service";
import { ChatAssistantService } from "../services/chatAssistant.service";

export const refreshTopCoinsJob = async () => {
  try {
    console.log("🔄 Refreshing top 10 coin prices...");
    await CoinGeckoService.fetchAndStoreTopCoins();
    await ChatAssistantService.rebuildFuseIndex();
  } catch (err: any) {
    console.error("Error refreshing top coins:", err.message);
  }
};