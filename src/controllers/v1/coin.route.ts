import { Router } from "express";
import { CoinService } from "../../services/coin.service";

const coinRouter = Router();

/**
 * Get top N coins (price, volume, % change)
 * Example: GET /api/crypto/top?limit=5
 */
coinRouter.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const coins = await CoinService.getTopCoins(limit);
    res.status(200).json(coins);
  } catch (error: any) {
    console.error("Error getting top coins:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get historical price trends for a selected coin
 * Example: GET /api/crypto/history/bitcoin
 */
coinRouter.get("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Coin ID is required" });
    }

    const history = await CoinService.getCoinHistory(id);
    res.status(200).json(history);
  } catch (error: any) {
    console.error("Error getting coin history:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default coinRouter;
