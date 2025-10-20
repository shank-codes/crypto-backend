// import Fuse from "fuse.js";
// import { CoinDAO } from "../daos/coin.dao";
// import { HistoricalPriceDAO } from "../daos/HistoricalPrice.dao";
// import { ChatResponse, IntentType, Entity } from "../types/chat.type";

// export class ChatAssistantService {
//   private static fuse: Fuse<{
//     id: string;
//     name: string;
//     symbol: string;
//   }> | null = null;

//   /** Initialize Fuse for fuzzy coin matching */
//   private static async getFuse() {
//     if (this.fuse) return this.fuse;

//     const coins = await CoinDAO.getAllCoins();
//     this.fuse = new Fuse(
//       coins.map((c) => ({
//         id: c.id,
//         name: c.name.toLowerCase(),
//         symbol: c.symbol.toLowerCase(),
//       })),
//       {
//         keys: ["name", "symbol"],
//         threshold: 0.4,
//       }
//     );

//     // console.log('this.fuse = ',this.fuse);

//     return this.fuse;
//   }

//   /** Main entry point */
//   static async processQuery(query: string): Promise<ChatResponse> {
//     const normalized = query.toLowerCase();
//     const fuse = await this.getFuse();

//     console.log('fuse = ',fuse);

//     // 1️⃣ Identify coin
//     const coinResult = fuse.search(normalized)[0];
//     if (!coinResult)
//       return {
//         type: "error",
//         message: "I couldn't identify the coin you're asking about.",
//       };
//     const coin: Entity = {
//       coinId: coinResult.item.id,
//       coinName: coinResult.item.name,
//     };

//     // 2️⃣ Detect intent
//     const intent = this.detectIntent(normalized);

//     // 3️⃣ Route based on intent
//     return await this.routeIntent(intent, coin);
//   }

//   /** Rule-based intent detection */
//   private static detectIntent(query: string): IntentType {
//     if (/\b(price|value|worth|doing|today)\b/.test(query)) return "price";
//     if (/\b(7[-\s]?day|week|weekly|last\s7)\b/.test(query)) return "trend_7";
//     if (/\b(30[-\s]?day|month|monthly|trend|chart|history)\b/.test(query))
//       return "trend_30";
//     return "unknown";
//   }

//   /** Route intent to the appropriate handler */
//   private static async routeIntent(
//     intent: IntentType,
//     coin: Entity
//   ): Promise<ChatResponse> {
//     switch (intent) {
//       case "price":
//         return await this.getPriceResponse(coin);
//       case "trend_7":
//         return await this.getTrendResponse(coin, 7);
//       case "trend_30":
//         return await this.getTrendResponse(coin, 30);
//       default:
//         return {
//           type: "error",
//           message: "Sorry, I couldn't understand your request.",
//         };
//     }
//   }

//   /** Handler for price queries */
//   private static async getPriceResponse(coin: Entity): Promise<ChatResponse> {
//     const data = await CoinDAO.findCoinById(coin.coinId);
//     if (!data)
//       return { type: "error", message: `No data found for ${coin.coinName}` };

//     return {
//       type: "price",
//       message: `💰 The current price of ${
//         coin.coinName
//       } is $${data.current_price.toFixed(2)}.`,
//       data,
//     };
//   }

//   /** Handler for trend queries */
//   private static async getTrendResponse(
//     coin: Entity,
//     days: number
//   ): Promise<ChatResponse> {
//     const history = await HistoricalPriceDAO.getLastNDays(coin.coinId, days);
//     if (!history?.length)
//       return {
//         type: "error",
//         message: `No historical data for ${coin.coinName}`,
//       };

//     return {
//       type: "trend",
//       message: `📈 Here’s the ${days}-day trend for ${coin.coinName}.`,
//       data: history.map((h) => ({ date: h.date, price: h.price })),
//     };
//   }
// }

import Fuse from "fuse.js";
import { CoinDAO } from "../daos/coin.dao";

export class ChatAssistantService {
  private static fuse: Fuse<any>;

  /**
   * Initialize Fuse with coin data.
   * Should be called once on app startup or when coins are updated.
   */
  static async init() {
    const coins = await CoinDAO.getAllCoins();

    this.fuse = new Fuse(coins, {
      keys: ["name", "symbol"],
      threshold: 0.4,
      includeScore: true,
      isCaseSensitive: false,
      ignoreLocation: true,
    });

    console.log(`✅ Fuse initialized with ${coins.length} coins`);
  }

  /**
   * Extract intent from user query.
   */
  private static detectIntent(
    query: string
  ): "price" | "trend_7" | "trend_30" | "unknown" {
    const q = query.toLowerCase();

    if (q.includes("price") || q.includes("value") || q.includes("worth"))
      return "price";
    if (
      q.includes("7 day") ||
      q.includes("7-day") ||
      q.includes("week") ||
      q.includes("7d")
    )
      return "trend_7";
    if (
      q.includes("30 day") ||
      q.includes("30-day") ||
      q.includes("month") ||
      q.includes("30d")
    )
      return "trend_30";

    return "unknown";
  }

  /**
   * Clean query for better Fuse matching.
   */
  private static preprocessQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[?.,]/g, "") // remove punctuation
      .replace(
        /\b(what|is|the|of|show|me|for|please|coin|crypto|today|current|tell|give|display)\b/g,
        ""
      )
      .trim();
  }

  /**
   * Main handler to process a user query.
   */
  static async processQuery(query: string) {
    if (!this.fuse) await this.init();

    // STEP 1: Detect intent first
    const intent = this.detectIntent(query);

    // STEP 2: Clean query
    const cleaned = this.preprocessQuery(query);
    console.log("🧹 Cleaned query:", cleaned);

    // STEP 3: Tokenize and try fuzzy search on each token
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    let bestMatch = null;
    let bestScore = Infinity;

    for (const token of tokens) {
      const result = this.fuse.search(token)[0];
      if (result && result.score! < bestScore) {
        bestScore = result.score!;
        bestMatch = result.item;
      }
    }

    if (!bestMatch) {
      console.log("🚫 No coin found for tokens:", tokens);
      return { type: "error", message: "Sorry, I couldn’t find that coin." };
    }

    const coin = bestMatch;
    console.log(`✅ Matched coin: ${coin.name}`);

    // STEP 4: Respond based on intent
    switch (intent) {
      case "price":
        return {
          type: "price",
          message: `The current price of ${coin.name} is $${coin.current_price}.`,
          data: { price: coin.current_price, name: coin.name },
        };

      case "trend_7":
        return {
          type: "trend_7",
          message: `Here’s the 7-day trend for ${coin.name}.`,
          data: coin.historicalPrices.slice(0, 7),
        };

      case "trend_30":
        return {
          type: "trend_30",
          message: `Here’s the 30-day trend for ${coin.name}.`,
          data: coin.historicalPrices.slice(0, 30),
        };

      default:
        return {
          type: "error",
          message:
            "Sorry, I couldn’t understand your request. Try asking like: 'What is the price of Bitcoin?' or 'Show me the 7-day trend of Ethereum.'",
        };
    }
  }
}
