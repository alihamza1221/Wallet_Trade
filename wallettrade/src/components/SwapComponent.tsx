"use client";
import React, { useState, forwardRef } from "react";
import { defaultTokens, Token } from "@bot/lib/tokens";
import { ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type SwapQuoteProps = {
  isConnected: boolean;
  onChangeSwapDirection: () => void;
  swapFrom: Token;
  swapTo: Token;
};
const SwapQuoteComponent = forwardRef<HTMLInputElement, SwapQuoteProps>(
  (props: SwapQuoteProps, ref: any) => {
    const { isConnected, onChangeSwapDirection, swapFrom, swapTo } = props;
    const [quote, setQuote] = useState("");
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [fromAmount, setFromAmount] = useState("");

    const fetchQuote = async (amount: any) => {
      if (!amount || parseFloat(amount) <= 0) {
        setQuote("");
        return;
      }

      setIsLoadingQuote(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              swapFrom: swapFrom,
              swapTo: swapTo,
              userAmount: amount,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setQuote(data.quote || data.amount || "");
        } else {
          console.error("Failed to fetch quote");
          setQuote("");
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
        setQuote("");
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const handleAmountBlur = (e: any) => {
      const amount = e.target.value;
      if (!amount || parseFloat(amount) <= 0) {
        setQuote("");
        return;
      }
      fetchQuote(amount);
    };
    const handleOnChangeSwapDirection = () => {
      onChangeSwapDirection();
      setQuote("");
      setFromAmount("");
    };
    return (
      <div>
        {/* value={isLoadingQuote ? "Loading..." : quote} */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Amount</label>
          <div className="relative">
            <Input
              ref={ref}
              type="number"
              placeholder="Get Quote"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              onBlur={handleAmountBlur}
              className="bg-black/50 border-gray-700 text-white pr-20 h-12 [&::-webkit-inner-spin-button]:appearance-none 
               [&::-webkit-outer-spin-button]:appearance-none 
               [-moz-appearance:textfield]"
            />
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center my-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleOnChangeSwapDirection}
            className=" text-yellow-400 hover:bg-yellow-400 hover:text-black rounded-full p-2"
          >
            <ArrowUpDown className="w-3 h-3 m-0" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2 relative ">
          <div className="relative">
            <Input
              type="number"
              placeholder={isLoadingQuote ? "Loading..." : "Quote"}
              value={
                isLoadingQuote ? "Loading..." : parseFloat(quote).toFixed(4)
              }
              disabled={false}
              readOnly={true}
              className="bg-black/50 border-gray-700 text-white pr-20 h-12 placeholder-gray-200"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default SwapQuoteComponent;
