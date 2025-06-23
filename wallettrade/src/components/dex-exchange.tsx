"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@bot/components/ui/button";
import { Input } from "@bot/components/ui/input";
import { useWalletClient } from "wagmi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@bot/components/ui/card";
import { Search, ScanSearchIcon } from "lucide-react";
import { Badge } from "@bot/components/ui/badge";
import { ArrowUpDown, Wallet, ChevronDown, Zap } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import { defaultTokens, Token } from "@bot/lib/tokens";

import SwapQuoteComponent from "./SwapComponent";

export default function DexExchange() {
  const { address, isConnected } = useAccount();

  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { data: walletClient } = useWalletClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleWalletConnect = () => {
    if (isConnected) {
      console.log("Disconnecting wallet...");
      disconnect();
    } else {
      open(); // This opens the wallet selection modal
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [selectedTokenType, setSelectedTokenType] = useState<"from" | "to">(
    "from"
  );

  const [fromToken, setFromToken] = useState(defaultTokens[1]);
  const [toToken, setToToken] = useState(defaultTokens[0]);

  const [allTokens, setAllTokens] = useState<Token[]>([]);
  function fetchTokens() {
    //get request to /tokens localhost:3000/tokens
    fetch("http://localhost:3001/tokens")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched tokens:", data.tokens);
        setAllTokens(data.tokens);
      })
      .catch((error) => {
        console.error("Error fetching tokens:", error);
      });
  }
  useEffect(() => {
    fetchTokens();
  }, []);
  // Mock order book data
  const sellOrders = [
    { price: 2533.68, amount: 0.1898, total: 480.89246 },
    { price: 2533.61, amount: 0.003, total: 7.60083 },
    { price: 2533.6, amount: 0.085, total: 215.356 },
    { price: 2533.59, amount: 0.37, total: 937.4283 },
    { price: 2533.5, amount: 1.958, total: 4960.593 },
    { price: 2533.49, amount: 1.1755, total: 2978.11749 },
    { price: 2533.4, amount: 0.085, total: 215.339 },
    { price: 2533.36, amount: 0.003, total: 7.60008 },
  ];

  const buyOrders = [
    { price: 2532.8, amount: 0.085, total: 215.288 },
    { price: 2532.71, amount: 0.0888, total: 224.90465 },
    { price: 2532.6, amount: 0.085, total: 215.271 },
    { price: 2532.52, amount: 0.415, total: 1050.9958 },
    { price: 2532.51, amount: 0.691, total: 1749.96441 },
    { price: 2532.4, amount: 0.085, total: 215.254 },
    { price: 2532.34, amount: 0.003, total: 7.59702 },
    { price: 2532.21, amount: 0.2421, total: 613.04804 },
  ];

  const popularTokens = [...defaultTokens];

  const currentPrice = 2533.29;

  const handleTradeInitiate = async () => {
    console.log("Trade initiated ", inputRef.current?.value);
    const body = {
      swapFrom: fromToken,
      swapTo: toToken,
      address: address,
      amount: inputRef.current?.value || "0",
    };
    console.log("Trade body:", body);
    const response = await fetch("http://localhost:3001/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const tx = data.transaction;
    tx.gas = BigInt(tx.gas);
    tx.value = BigInt(tx.value);
    const result = await walletClient?.sendTransaction(tx);
    console.log("Transaction result:", result);
    return;
  };
  const onChangeSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">
                  WalletTrader
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-100 flex items-center gap-2 p-3 px-3"
              >
                <div className=" bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9cUvoCvmCXO4pNHvnREHBCKW30U-BVxKfg&s"
                    alt="BNB Chain Logo"
                    className="rounded-lg"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-black">BNB Chain</span>
              </Button>
              <Button
                onClick={() => handleWalletConnect()}
                className={
                  isConnected
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-400 text-black hover:bg-yellow-500"
                }
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnected ? "Connected" : "Connect Wallet"}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-yellow-500/20">
              <div className="flex flex-col gap-3">
                <Badge
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 w-fit"
                >
                  BSC Network
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white w-full justify-start flex items-center gap-2 px-3"
                >
                  <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span>BNB Chain</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleWalletConnect}
                  className={`w-full justify-start ${
                    isConnected
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnected ? "Connected" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 max-w-[768px]">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Side - Swap Interface */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-yellow-500/20 h-full">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Swap Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trading Pair */}
                <div
                  className="flex items-center justify-between p-3 bg-black/50 rounded-lg cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={() => {
                    setSelectedTokenType("from");
                    setShowTokenModal(true);
                  }}
                >
                  <span className="text-sm text-gray-400">
                    {fromToken.symbol}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {fromToken.symbol + "/" + toToken.symbol}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between p-3 bg-black/50 rounded-lg cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={() => {
                    setSelectedTokenType("to");
                    setShowTokenModal(true);
                  }}
                >
                  <span className="text-sm text-gray-400">
                    {toToken.symbol}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{toToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Market Order Label */}
                <div className="flex items-center justify-center p-3 bg-black/50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-400">
                    Market Order
                  </span>
                </div>

                {/* Swap Token */}
                <SwapQuoteComponent
                  isConnected={isConnected}
                  onChangeSwapDirection={onChangeSwapDirection}
                  ref={inputRef}
                  swapFrom={fromToken}
                  swapTo={toToken}
                />
                {/* Trade Button */}
                <Button
                  className={`w-full h-12 font-semibold ${
                    isConnected
                      ? "bg-yellow-400 text-black cursor-pointer hover:bg-yellow-500"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isConnected}
                  onClick={handleTradeInitiate}
                >
                  {isConnected ? "Trade" : "Connect Wallet to Trade"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Book */}
          <div className="md:col-span-1">
            <Card className="bg-gray-900 border-yellow-500/20 h-full gap-4">
              <CardHeader className="pb-0">
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
              <CardContent className="pt-0">
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
                        {order.price.toFixed(2)}
                      </div>
                      <div className="text-right text-gray-300 font-mono">
                        {order.amount.toFixed(4)}
                      </div>
                      <div className="text-right text-gray-300 font-mono">
                        {order.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 5,
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current Price Section */}
                <div className="flex items-center justify-between  mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-400">
                      {currentPrice.toFixed(2)}
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
                        {order.price.toFixed(2)}
                      </div>
                      <div className="text-right text-gray-300 font-mono">
                        {order.amount.toFixed(4)}
                      </div>
                      <div className="text-right text-gray-300 font-mono">
                        {order.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 5,
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Market Summary Bar */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400 font-medium">B 47.39%</span>
                  <div className="flex-1 mx-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-red-400"
                      style={{ width: "47.39%" }}
                    ></div>
                  </div>
                  <span className="text-red-400 font-medium">52.61% S</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {selectedTokenType === "from" ? "From" : "To"}
              </h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="search name / address"
                  value={tokenSearchQuery}
                  onChange={(e) => setTokenSearchQuery(e.target.value)}
                  className="bg-gray-800 border-purple-500 text-white pr-10 h-12 rounded-xl"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <ScanSearchIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Network Info */}
              <div className="mt-1.5 text-sm text-gray-400">
                Network: BNB Chain
              </div>

              {/* Token Icons Row */}
              <div className="flex items-center gap-2 mt-1.5">
                {popularTokens.slice(0, 6).map((token, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg cursor-pointer"
                    onClick={() => {
                      // Handle token selection
                      if (selectedTokenType === "from") {
                        setFromToken(token);
                      } else {
                        setToToken(token);
                      }
                      setShowTokenModal(false);
                    }}
                  >
                    <Image
                      src={token.logoURI}
                      alt={token.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </button>
                ))}
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-400">
                  +2
                </div>
              </div>
            </div>

            {/* Token List */}
            <div
              className="max-h-90 overflow-y-auto   [&::-webkit-scrollbar]:hidden 
                [-ms-overflow-style:none] 
                [scrollbar-width:none]"
            >
              {allTokens
                .filter(
                  (token) =>
                    token.symbol
                      .toLowerCase()
                      .includes(tokenSearchQuery.toLowerCase()) ||
                    token.name
                      .toLowerCase()
                      .includes(tokenSearchQuery.toLowerCase())
                )
                .map((token, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Handle token selection
                      if (selectedTokenType === "from") {
                        setFromToken(token);
                      } else {
                        setToToken(token);
                      }
                      setShowTokenModal(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                        <Image
                          src={token.logoURI}
                          alt={token.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium">
                          {token.symbol}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isConnected && (
                        <div className="text-right">
                          <div className="text-white text-sm">{token.name}</div>
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
