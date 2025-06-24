import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getQuote } from "@bot/lib/getQuote";
import { Token } from "@bot/lib/tokens";

type OrderBookProps = {
  fromToken: Token;
  toToken: Token;
};

const OrderBook = (props: OrderBookProps) => {
  const { fromToken, toToken } = props;
  const [quote, setQuote] = React.useState("0.0");
  const [sellOrders, setSellOrders] = React.useState<
    Array<{ price: number; amount: number; total: number }>
  >([]);
  const [buyOrders, setBuyOrders] = React.useState<
    Array<{ price: number; amount: number; total: number }>
  >([]);

  // Function to generate random amount between min and max
  const getRandomAmount = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  // Function to generate sell orders (above current price)
  const generateSellOrders = (currentPrice: number) => {
    const orders = [];
    for (let i = 0; i < 8; i++) {
      const priceOffset = getRandomAmount(0.01, 2.5); // Random offset above current price
      const price = currentPrice + priceOffset + i * 0.1;
      const amount = getRandomAmount(0.003, 2.0);
      const total = price * amount;
      orders.push({ price, amount, total });
    }
    return orders.sort((a, b) => b.price - a.price); // Sort descending (highest first)
  };

  // Function to generate buy orders (below current price)
  const generateBuyOrders = (currentPrice: number) => {
    const orders = [];
    for (let i = 0; i < 8; i++) {
      const priceOffset = getRandomAmount(0.01, 2.5); // Random offset below current price
      const price = currentPrice - priceOffset - i * 0.1;
      const amount = getRandomAmount(0.003, 2.0);
      const total = price * amount;
      orders.push({ price, amount, total });
    }
    return orders.sort((a, b) => b.price - a.price); // Sort descending (highest first)
  };

  // Function to fetch quote and update order book
  const fetchQuoteAndUpdateOrderBook = React.useCallback(async () => {
    try {
      const quoteResult = await getQuote(fromToken, toToken, "1");
      console.log("Quote result:", quoteResult);
      setQuote(quoteResult ?? "0.0");

      const currentPrice = parseFloat(quoteResult ?? "0");

      setSellOrders(generateSellOrders(currentPrice));
      setBuyOrders(generateBuyOrders(currentPrice));
    } catch (error) {
      console.error("Failed to fetch quote:", error);
    }
  }, [fromToken, toToken]);

  React.useEffect(() => {
    fetchQuoteAndUpdateOrderBook();
    const interval = setInterval(fetchQuoteAndUpdateOrderBook, 10000);

    return () => clearInterval(interval);
  }, [fetchQuoteAndUpdateOrderBook]);

  return (
    <div className="md:col-span-1">
      <Card className="bg-gray-900 border-yellow-500/20 h-full gap-4 border-l-0 md:border-1 rounded-tl-none  rounded-bl-none md:rounded-xl">
        <CardHeader className="pb-0 px-0 pr-2 md:px-6 ">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-medium">
              {fromToken.symbol} / {toToken.symbol}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">0.01</span>
                {/* <ChevronDown className="w-4 h-4 text-gray-400" /> */}
              </div>
              {/* <button className="text-gray-400 hover:text-white">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0 pr-2 md:px-6">
          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-3 px-1">
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Total</div>
          </div>

          {/* Sell Orders */}
          <div className="space-y-0.5 mb-2">
            {sellOrders.map((order, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-2 text-xs hover:bg-gray-800/50 px-1 py-0.5 rounded"
              >
                <div className="text-red-400 font-mono">
                  {order.price.toFixed(3)}
                </div>
                <div className="text-right text-gray-300 font-mono">
                  {order.amount.toFixed(3)}
                </div>
                <div className="text-right text-gray-300 font-mono">
                  {order.total.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Current Price Section */}
          <div className="flex items-center justify-between  mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-400">
                {parseFloat(quote).toFixed(4)}
              </span>
            </div>
          </div>

          {/* Buy Orders */}
          <div className="space-y-0.5 mb-2">
            {buyOrders.map((order, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-2 text-xs hover:bg-gray-800/50 px-1 py-0.5 rounded"
              >
                <div className="text-green-400 font-mono">
                  {/* @ts-ignore */}
                  {Math.abs(order.price?.toFixed(3))}
                </div>
                <div className="text-right text-gray-300 font-mono">
                  {/* @ts-ignore */}
                  {Math.abs(order.amount.toFixed(3))}
                </div>
                <div className="text-right text-gray-300 font-mono">
                  {/* @ts-ignore */}
                  {Math.abs(order.total.toFixed(1))}
                </div>
              </div>
            ))}
          </div>

          {/* Market Summary Bar */}
          {/* <div className="flex items-center justify-between text-sm">
            <span className="text-green-400 font-medium">B 47.39%</span>
            <div className="flex-1 mx-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-red-400"
                style={{ width: "47.39%" }}
              ></div>
            </div>
            <span className="text-red-400 font-medium">52.61% S</span>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderBook;
