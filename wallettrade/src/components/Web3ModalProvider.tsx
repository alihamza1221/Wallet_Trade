"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { State, WagmiProvider } from "wagmi";
import { ReactNode } from "react";
import { config } from "@bot/lib/config";
import { chains } from "@bot/lib/config";
// Setup queryClient
const queryClient = new QueryClient();

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  enableOnramp: false,
  enableSwaps: false,
  enableAnalytics: false,
  defaultChain: chains[0],
});

interface Web3ModalProviderProps {
  children: ReactNode;
  initialState?: State;
}

export default function Web3ModalProvider({
  children,
  initialState,
}: Web3ModalProviderProps) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
