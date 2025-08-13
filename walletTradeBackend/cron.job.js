import db, { client } from "./utils/db.js";
import cron from "node-cron";

const api_url = "https://fapi.binance.com/fapi/v1/premiumIndex";

async function updateTokensUsdtPrice() {
  db();
  const collection = client.db("tradewallet").collection("tokens");
  const tokens = await collection.find({}).toArray();
  const marketData = await getMarkPrice();

  for (const token of tokens) {
    const symbol = token.symbol;
    const curPair = marketData.find((pair) =>
      pair?.symbol.toLowerCase().includes(symbol.toLowerCase())
    );
    if (curPair) {
      token.usdtPrice = curPair.markPrice;

      const updateData = {
        usdtPrice: token.usdtPrice,
      };
      const result = await collection.updateOne(
        { symbol: symbol },
        { $set: updateData }
      );
    }
  }
}

async function getMarkPrice() {
  try {
    const response = await fetch(`${api_url}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching mark price:", error);
    return [];
  }
}

cron.schedule("*/5 * * * *", updateTokensUsdtPrice);
