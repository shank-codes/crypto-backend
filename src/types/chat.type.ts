export type ChatResponseType = "price" | "trend" | "error";

export interface ChatResponse {
  type: ChatResponseType;
  message: string;
  data?: any;
}

export type IntentType =
  | "price"
  | "market_cap"
  | "market_rank"
  | "volume"
  | "change_24h"
  | "last_updated"
  | "overview"
  | "trend"
  | "unknown";

export interface Entity {
  coinId: string;
  coinName: string;
  days?: number;
}

export type CoinIntent = { type: IntentType; days?: number };
