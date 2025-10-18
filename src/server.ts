import { PrismaClient } from "@prisma/client";
import app from "./app";

const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

async function startServer() {
  try {
    await prisma.$connect(); // attempt connection
    console.log("✅ Connected to DB successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to DB", error);
    process.exit(1);
  }
}

startServer();
