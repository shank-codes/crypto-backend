import Fuse from "fuse.js";
import { CoinDAO } from "../daos/coin.dao";
import { CoinIntent } from "../types/chat.type";

export class ChatAssistantService {
  private static fuse: Fuse<any>;

  // Rebuild Fuse index with latest coin data
  static async rebuildFuseIndex() {
    const coins = await CoinDAO.getAllCoins(10); // or 10 if top 10 only
    this.fuse = new Fuse(coins, {
      keys: ["name", "symbol"],
      threshold: 0.4,
      includeScore: true,
      isCaseSensitive: false,
      ignoreLocation: true,
    });
  }

  /**
   * Initialize Fuse with coin data.
   * Should be called once on app startup or when coins are updated.
   */
  static async init() {
    if (this.fuse) return; // only initialize once
    await this.rebuildFuseIndex();
  }

  private static detectIntent(query: string): CoinIntent {
    const q = query.toLowerCase().trim();

    // 👋 Greetings intent
    if (/\b(hi|hii|hello|hey|good\s*(morning|afternoon|evening))\b/.test(q)) {
      return { type: "greeting" };
    }

    // 🔍 Match trend pattern (e.g., 7-day, 14 day, 30 days, trend_n)
    const trendMatch = q.match(/(\d+)\s*(?:day|days|d)\b/);
    if (trendMatch) {
      const days = parseInt(trendMatch[1]);
      if (!isNaN(days)) return { type: "trend", days };
    }

    if (/\b(change|24h|today change|% change)\b/.test(q))
      return { type: "change_24h" };

    if (/\b(price|value|worth|trading|current)\b/.test(q))
      return { type: "price" };

    if (/\b(market cap|capitalization|total value)\b/.test(q))
      return { type: "market_cap" };

    if (/\b(rank|position|market rank)\b/.test(q))
      return { type: "market_rank" };

    if (/\b(volume|trading volume|liquidity)\b/.test(q))
      return { type: "volume" };

    if (/\b(last updated|refreshed|update time)\b/.test(q))
      return { type: "last_updated" };

    if (/\b(details|info|overview|summary|about)\b/.test(q))
      return { type: "overview" };

    return { type: "unknown" };
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

    if (intent.type === "greeting") {
      const greetings = [
        "👋 Hey there! How can I help you today?",
        "Hi! 😊 Ask me about any crypto — prices, trends, or stats!",
        "Hello! 🚀 Ready to explore the crypto market?",
        "Hey! 👋 You can ask things like '7-day trend of Ethereum' or 'Bitcoin price'!",
      ];
      const randomGreeting =
        greetings[Math.floor(Math.random() * greetings.length)];
      return { type: "greeting", message: randomGreeting };
    }

    // STEP 2: Clean query
    const cleaned = this.preprocessQuery(query);

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
    switch (intent.type) {
      case "price":
        return {
          type: "price",
          message: `💰 The current price of ${
            coin.name
          } is $${coin.current_price.toLocaleString()}.`,
          data: {
            name: coin.name,
            symbol: coin.symbol,
            price: coin.current_price,
            last_updated: coin.last_updated,
          },
        };

      case "trend":
        const days = intent.days;
        const slicedData = coin.historicalPrices.slice(0, days);

        return {
          type: "trend",
          message: `📈 Here’s the ${days}-day price trend for ${coin.name}.`,
          data: {
            name: coin.name,
            symbol: coin.symbol,
            days,
            trend: slicedData,
          },
        };

      case "market_cap":
        return {
          type: "market_cap",
          message: `The market capitalization of ${
            coin.name
          } is $${coin.market_cap.toLocaleString()}.`,
          data: { market_cap: coin.market_cap, name: coin.name },
        };

      case "market_rank":
        return {
          type: "market_rank",
          message: `${coin.name} is currently ranked #${coin.market_cap_rank} by market cap.`,
          data: { rank: coin.market_cap_rank, name: coin.name },
        };

      case "volume":
        return {
          type: "volume",
          message: `The total trading volume for ${
            coin.name
          } is $${coin.total_volume.toLocaleString()}.`,
          data: { volume: coin.total_volume, name: coin.name },
        };

      case "change_24h":
        return {
          type: "change_24h",
          message: `${
            coin.name
          } has changed ${coin.price_change_percentage_24h.toFixed(
            2
          )}% in the last 24 hours.`,
          data: {
            change_24h: coin.price_change_percentage_24h,
            name: coin.name,
          },
        };

      case "last_updated":
        return {
          type: "last_updated",
          message: `The latest update for ${coin.name} was on ${new Date(
            coin.last_updated
          ).toLocaleString()}.`,
          data: { last_updated: coin.last_updated, name: coin.name },
        };

      case "overview":
        return {
          type: "overview",
          message: `${coin.name} Overview:\nPrice: $${
            coin.current_price
          }\nMarket Cap: $${coin.market_cap}\nRank: #${
            coin.market_cap_rank
          }\n24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%`,
          data: {
            name: coin.name,
            price: coin.current_price,
            rank: coin.market_cap_rank,
            market_cap: coin.market_cap,
            change_24h: coin.price_change_percentage_24h,
          },
        };

      default:
        return {
          type: "error",
          message:
            "❓ Sorry, I couldn’t understand your request. Try asking like:\n• 'What is the price of Bitcoin?'\n• 'Show me the 14-day trend of Ethereum.'",
        };
    }
  }
}
