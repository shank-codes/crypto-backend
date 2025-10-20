export type ChatResponseType = "price" | "trend" | "error";

export interface ChatResponse {
  type: ChatResponseType;
  message: string;
  data?: any;
}

export type IntentType = "price" | "trend_7" | "trend_30" | "unknown";

export interface Entity {
  coinId: string;
  coinName: string;
  days?: number;
}