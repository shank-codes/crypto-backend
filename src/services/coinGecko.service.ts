import { coinGeckoApi } from "../utils/apiClient";
import { CoinDAO } from "../daos/coin.dao";
import { HistoricalPriceDAO } from "../daos/HistoricalPrice.dao";

export class CoinGeckoService {
  /**
   * Fetch top 10 coins by market cap and upsert into DB
   */
  static async fetchAndStoreTopCoins() {
    try {
      console.log("Fetching top 10 coins from CoinGecko...");

      const response = await coinGeckoApi.get("/coins/markets", {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      });

      const coins = response.data;

      for (const coin of coins) {
        await CoinDAO.upsertCoin({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          total_volume: coin.total_volume,
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          last_updated: new Date(coin.last_updated),
        });
      }

      console.log("Successfully updated top 10 coins in DB");
    } catch (error: any) {
      console.error("Error fetching/storing coins:", error.message);
      throw new Error("Failed to fetch and store crypto data");
    }
  }

  /**
   * Fetch 30 days of historical prices for a specific coin
   */
  static async fetchAndStoreHistoricalData(coinId: string) {
    try {
      console.log(`Fetching 30-day history for ${coinId}...`);

      const response = await coinGeckoApi.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: "usd",
          days: 29,
          interval: 'daily'
        },
      });

      const { prices } = response.data; // { prices: [ [timestamp, price], ...] }

      await HistoricalPriceDAO.insertPriceHistory(coinId, prices);

      console.log(`Stored 30-day history for ${coinId}`);
    } catch (error: any) {
      console.error(`Failed to fetch history for ${coinId}:`, error.message);
      throw new Error(`Failed to fetch history for ${coinId}`);
    }
  }

  /**
   * Orchestrate full refresh (top 10 + their 30-day histories)
   */
  static async refreshCryptoData() {
    await this.fetchAndStoreTopCoins();

    const topCoins = await CoinDAO.getAllCoins(10);

    for (const coin of topCoins) {
      await this.fetchAndStoreHistoricalData(coin.id);
    }

    console.log("Crypto data refresh complete.");
  }
}
