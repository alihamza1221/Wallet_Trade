import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { bsc, bscTestnet } from "wagmi/chains";
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const metadata = {
  name: "Your DEX App",
  description: "Swap tokens on BNB Chain",
  url: "https://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig
const chains = [bsc, bscTestnet] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});
