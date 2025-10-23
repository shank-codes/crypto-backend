# Crypto Dashboard Backend

Node.js backend for the Crypto Dashboard application.  
Provides APIs for top 10 cryptocurrencies, historical price trends, and a chatbot assistant.

Built with **Node.js**, **TypeScript**, **Prisma**, and **PostgreSQL**.

---

## Features

- Fetch top 10 coins by market cap from CoinGecko
- Store coin data and 30-day historical prices in PostgreSQL
- Serve historical prices for frontend charts
- Chatbot API to answer user queries about crypto
- Cron jobs to refresh coin data every 1 minute
- Future-ready for Redis caching and unit testing

---

## Requirements

- Node.js >= 18
- PostgreSQL database
- npm or yarn
- Optional: Redis (for caching in future enhancements)

---

## Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd crypto-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a .env file at the root:

```bash
PORT=4000
NODE_ENV=development
BACKEND_URL=http://localhost:4000
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_db
COINGECKO_API_BASE=https://api.coingecko.com/api/v3
COIN_GECKO_API_KEY=
```

---

## Database Setup

### 1. Prisma Setup

```bash
npm run db:generate
```

### 2. Migrate Database to create tables

```bash
npm run db:push
```
### 3. Seed data
- `GET /api/v1/crypto/refresh` – Fetch and store top 10 crypto coins data
---

## Running the server

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run start
```
---

## API Endpoints

### Coins

- `GET /api/v1/coins` – Top 10 coins
- `GET /api/v1/coins/history/:id` – Historical price data for a coin

### Chat

- `POST /api/chat` – Send a user query to the chatbot
  - Request body:
    ```json
    { "query": "What is the price of Bitcoin?" }
    ```
  - Response example:
    ```json
    {
      "type": "price",
      "message": "💰 The current price of Bitcoin is $30,000.",
      "data": {
        "name": "Bitcoin",
        "symbol": "btc",
        "price": 30000,
        "last_updated": "2025-10-23T14:00:00.000Z"
      }
    }
    ```

---

## Cron Jobs

- Refresh top 10 coins every 1 minute
- Fetch 30-day historical prices for each coin
- Exclude today’s price to avoid conflicts with live updates
- Only run cron jobs in production (`NODE_ENV=production`)

> Note: This ensures that the frontend always receives up-to-date data from your backend without hitting CoinGecko directly.

---

## Frontend Integration Notes

- Frontend should fetch coin data from `/api/coins` instead of CoinGecko.
- Historical price data is available from `/api/coins/:id`.
- Revalidation on the frontend can be done periodically, but the backend cron ensures database is up-to-date.

---

## Future Enhancements

- **Testing**: Add Jest unit and integration tests
- **Redis caching**: Cache frequently accessed endpoints
- **Error monitoring**: Integrate Sentry or similar
- **Rate limiting**: Protect APIs from abuse
