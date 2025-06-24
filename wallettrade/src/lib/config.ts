import { walletConnect, injected } from "wagmi/connectors";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { bsc } from "wagmi/chains"; // ✅ Only BSC mainnet

const metadata = {
  name: "Wallet Trader",
  description: "Trade tokens on BSC",
  url: "https://wallet-trade.vercel.app/",
  icons: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6KQI1Sc59pWwfamldUbhXRMUiY-XvZD66rA&s",
  ],
};
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const chains = [bsc] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  auth: {
    email: false, // No email option
    socials: [], // No social providers
    showWallets: true, // Keep wallet options
    walletFeatures: false, // Disable extra features
  },
  connectors: [injected(), walletConnect({ projectId })],
});
