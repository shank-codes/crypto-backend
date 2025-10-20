import { CoinDAO } from "../daos/coin.dao";
import { HistoricalPriceDAO } from "../daos/HistoricalPrice.dao";

export class CoinService {
  /**
   * Get top N coins sorted by market cap rank
   */
  static async getTopCoins(limit: number = 10) {
    try {
      const coins = await CoinDAO.getAllCoins(limit);
      return coins.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        total_volume: coin.total_volume,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_rank: coin.market_cap_rank,
        last_updated: coin.last_updated,
      }));
    } catch (error: any) {
      console.error("❌ Error in CoinService.getTopCoins:", error.message);
      throw new Error("Failed to retrieve top coins");
    }
  }

  /**
   * Get historical price trend for a specific coin
   */
  static async getCoinHistory(coinId: string) {
    try {
      const history = await HistoricalPriceDAO.getPriceHistory(coinId);

      if (!history.length) {
        throw new Error(`No historical data found for coin: ${coinId}`);
      }

      // Format for frontend charts
      return history.map((record) => ({
        date: record.date,
        price: record.price,
      }));
    } catch (error: any) {
      console.error(`❌ Error in CoinService.getCoinHistory: ${error.message}`);
      throw new Error(`Failed to fetch historical data for ${coinId}`);
    }
  }
}
