import { CoinGeckoService } from "../services/coinGecko.service";
import { CoinDAO } from "../daos/coin.dao";

export const updateHistoricalPricesJob = async () => {
  try {
    console.log("📊 Updating historical prices...");
    const topCoins = await CoinDAO.getAllCoins(10); // get top 10 coins from DB
    for (const coin of topCoins) {
      await CoinGeckoService.fetchAndStoreHistoricalData(coin.id);
    }
  } catch (err: any) {
    console.error("Error updating historical prices:", err.message);
  }
};
