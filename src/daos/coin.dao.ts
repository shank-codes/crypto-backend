import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CoinDAO {
  static async upsertCoin(coinData: Prisma.CoinCreateInput) {
    try {
      return await prisma.coin.upsert({
        where: { id: coinData.id },
        update: coinData,
        create: coinData,
      });
    } catch (error: any) {
      console.error(`Error upserting coin ${coinData.id}:`, error);
      throw new Error(`Failed to save or update coin ${coinData.name}.`);
    }
  }

  static async getAllCoins(limit: number | undefined = undefined) {
    try {
      return await prisma.coin.findMany({
        take: limit || undefined,
        include: {
          historicalPrices: {
            select: {
              date: true,
              price: true,
            },
          },
        },
        orderBy: {
          market_cap_rank: "asc",
        },
      });
    } catch (error: any) {
      console.error("Error fetching coins:", error);
      throw new Error("Failed to fetch coins from database.");
    }
  }

  static async findCoinById(id: string) {
    try {
      return prisma.coin.findUnique({ where: { id } });
    } catch (error: any) {
      console.error("Error fetching coin by Id:", error);
      throw new Error("Failed to fetch coin by Id from database.");
    }
  }
}
