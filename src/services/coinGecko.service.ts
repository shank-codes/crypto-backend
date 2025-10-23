import { coinGeckoApi } from "../utils/apiClient";
import { CoinDAO } from "../daos/coin.dao";
import { HistoricalPriceDAO } from "../daos/HistoricalPrice.dao";

export class CoinGeckoService {
  /**
   * Fetch top 10 coins by market cap and update DB
   */
  static async fetchAndStoreTopCoins() {
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

    console.log("Updated top 10 coins in DB");
  }

  /**
   * Fetch historical prices (excluding today) for a coin
   */
  static async fetchAndStoreHistoricalData(coinId: string, days = 30) {
    const response = await coinGeckoApi.get(`/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: "usd",
        days,
        interval: "daily",
      },
    });

    const { prices } = response.data as { prices: Array<[number, number]> };

    // Remove today's price
    const filteredPrices = prices.slice(0, -1);

    await HistoricalPriceDAO.insertPriceHistory(coinId, filteredPrices);

    console.log(`Stored historical prices for ${coinId}`);
  }

  /**
   * Efficient full refresh
   */
  static async refreshCryptoData() {
    await this.fetchAndStoreTopCoins(); // current prices every minute

    const topCoins = await CoinDAO.getAllCoins(10);

    for (const coin of topCoins) {
      await this.fetchAndStoreHistoricalData(coin.id); // fetch past 30 days once
    }

    console.log("Crypto data refresh complete.");
  }
}
