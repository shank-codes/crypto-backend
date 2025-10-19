import axios from "axios";

export const coinGeckoApi = axios.create({
  baseURL: process.env.COIN_GECKO_API,
  timeout: 10000,
  headers: {
    "x-cg-demo-api-key": process.env.COIN_GECKO_API_KEY,
  },
});
