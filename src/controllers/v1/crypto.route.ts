import { Router } from "express";
import { CoinGeckoService } from "../../services/coinGecko.service";

const cryptoRouter = Router();

cryptoRouter.get("/refresh", async (_req, res) => {
  try {
    await CoinGeckoService.refreshCryptoData();
    res.status(200).json({ message: "Crypto data refreshed successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default cryptoRouter;
