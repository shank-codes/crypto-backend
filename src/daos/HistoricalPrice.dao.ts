import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class HistoricalPriceDAO {
  static async insertPriceHistory(coinId: string, priceData: number[][]) {
    try {
      // delete old history (optional, keep only 30 days)
      await prisma.historicalPrice.deleteMany({
        where: { coinId: coinId },
      });

      // bulk insert
      await prisma.historicalPrice.createMany({
        data: priceData.map(([timestamp, price]) => ({
          coinId,
          date: new Date(timestamp),
          price: price,
        })),
      });

      return true;
    } catch (error: any) {
      console.error(`Error inserting price history for ${coinId}:`, error);
      throw new Error(`Failed to save price history for ${coinId}.`);
    }
  }

  static async getPriceHistory(coinId: string) {
    try {
      return await prisma.historicalPrice.findMany({
        where: { coinId },
        orderBy: { date: "desc" },
      });
    } catch (error: any) {
      console.error(`Error fetching price history for ${coinId}:`, error);
      throw new Error(`Failed to fetch price history for ${coinId}.`);
    }
  }
}
