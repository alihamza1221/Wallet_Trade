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
import { ScanSearchIcon } from "lucide-react";
import { ArrowUpDown, Wallet, ChevronDown, Zap } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import { defaultTokens, Token } from "@bot/lib/tokens";
import { useToast } from "@bot/components/ToastProvider";

import SwapQuoteComponent from "./SwapComponent";
import OrderBook from "./OrderBook";
import { useBalance } from "wagmi";

export default function DexExchange() {
  const { address, isConnected } = useAccount();
  const {
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    showToast,
    hideToast,
  } = useToast();

  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [walletConnectToastId, setWalletConnectToastId] = useState<string>("");
  const { data: walletClient } = useWalletClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const bnbBalance = useBalance({ address });
  const handleWalletConnect = async () => {
    if (isConnected) {
      console.log("Disconnecting wallet...");

      disconnect();
      showToast({
        type: "info",
        title: "Wallet Disconnected",
        message: "Your wallet has been disconnected successfully",
      });
    } else {
      const toastId = showLoadingToast(
        "Connecting Wallet",
        "Please approve the connection in your wallet..."
      );
      setWalletConnectToastId(toastId);

      await open();
      setTimeout(() => {
        hideToast(toastId);
      }, 1500); // Simulate a delay for connection
    }
  };

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [selectedTokenType, setSelectedTokenType] = useState<"from" | "to">(
    "from"
  );

  const [fromToken, setFromToken] = useState(defaultTokens[1]);
  const [toToken, setToToken] = useState(defaultTokens[1]);

  const [isLoadingTrade, setIsLoadingTrade] = useState(false);
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  function fetchTokensViaPanCakeSwap() {
    //get request to /tokens localhost:3000/tokens
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tokens`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched tokens:", data.tokens);
        setAllTokens(data.tokens);
      })
      .catch((error) => {
        console.error("Error fetching tokens:", error);
      });
  }
  const fetchTokens = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dexTokens`
      );
      if (response.ok) {
        const data = await response.json();
        setAllTokens(data.tokens);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };
  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (isConnected && walletConnectToastId != "") {
      updateToastToSuccess(
        walletConnectToastId,
        "Wallet Connection Success",
        "Wallet modal closed "
      );
    }
  }, [isConnected]);

  const handleTradeInitiate = async () => {
    if (isLoadingTrade) {
      showToast({
        type: "info",
        title: "Trade in Progress",
        message: "Please wait for the current trade to complete.",
      });
      return;
    }
    try {
      setIsLoadingTrade(true);
      // Show loading toast
      const toastId = showLoadingToast(
        "Executing Trade",
        `Swapping ${inputRef.current?.value || "0"} ${fromToken.symbol} for ${
          toToken.symbol
        }`
      );

      setWalletConnectToastId(toastId);
      const body = {
        swapFrom: fromToken,
        swapTo: toToken,
        address: address,
        amount: inputRef.current?.value || "0",
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/swap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        updateToastToError(
          walletConnectToastId,
          "Trade Failed",
          "An error occurred while executing the trade. Please try again."
        );
      }

      const data = await response.json();
      const tx = data.transaction;
      tx.gas = BigInt(tx.gas);
      tx.value = BigInt(tx.value);
      const result = await walletClient?.sendTransaction(tx);

      updateToastToSuccess(
        toastId,
        "Trade Executed Successfully",
        `Swapped ${inputRef.current?.value || "0"} ${fromToken.symbol} for ${
          toToken.symbol
        }`
      );
    } catch (error) {
      updateToastToError(
        walletConnectToastId,
        "Trade Failed",
        "An error occurred while executing the trade. Please try again."
      );
      console.error("Error initiating trade:", error);
    } finally {
      setIsLoadingTrade(false);
    }
  };
  const onChangeSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-black/95 backdrop-blur-sm sticky top-0 z-50 overflow-hidden">
        <div className="container mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                <Zap className=" w-5 h-5 sm:w-8 sm:h-8 text-yellow-400" />
                <span className="text-lg sm:text-xl font-bold text-yellow-400">
                  WalletTrader
                </span>
              </div>
            </div>

            {/*  Navigation */}
            <div className="flex items-center gap-1 md:gap-4">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-100 flex items-center gap-1 p-1.5 px-2 md:gap-2  md:p-3 md:px-3 "
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
                <span className="text-black">
                  {parseFloat(bnbBalance.data?.formatted ?? "0").toFixed(3)}
                </span>
              </Button>
              <Button
                onClick={() => handleWalletConnect()}
                className={
                  isConnected
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-400 text-black hover:bg-yellow-500"
                }
              >
                <Wallet className="w-3 h-3 mr-0 md:w-4 md:h-4 md:mr-2" />
                {isConnected ? "Connected" : "Start Trade"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto md:px-4 py-6 max-w-[768px]">
        <div className="grid grid-cols-2 gap-0 md:gap-4">
          {/* Left Side - Swap Interface */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-yellow-500/20 h-full border-r-0 md:border-[1px]  rounded-tr-none rounded-br-none md:rounded-xl ">
              <CardHeader className="px-2 md:px-6">
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Swap Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-2 md:px-6">
                {/* Trading Pair */}
                <div
                  className="flex items-center justify-between p-2 px-3 md:p-3 bg-black/50 rounded-lg cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={() => {
                    setSelectedTokenType("from");
                    setShowTokenModal(true);
                  }}
                >
                  <span className="text-sm text-white">{fromToken.symbol}</span>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between p-2 px-3 md:p-3 bg-black/50 rounded-lg cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={() => {
                    setSelectedTokenType("to");
                    setShowTokenModal(true);
                  }}
                >
                  <span className="text-sm text-white">{toToken.symbol}</span>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Market Order Label */}
                <div className="flex items-center justify-center  md:bg-black/50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-400 p-1.5 bg-black/50 rounded-lg px-3 md:p-3 md:bg-transparent">
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
                  {isLoadingTrade
                    ? "Making Trade..."
                    : isConnected
                    ? "Trade"
                    : "Connect Wallet to Trade"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Book */}
          <OrderBook fromToken={fromToken} toToken={toToken} />
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
              {/* <div className="flex items-center gap-2 mt-1.5">
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
              </div> */}
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
