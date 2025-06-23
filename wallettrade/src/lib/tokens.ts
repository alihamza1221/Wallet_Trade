export type Token = {
  name: string;
  symbol: string;
  address?: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  isNative?: boolean;
  isToken?: boolean;
};

export const defaultTokens: Token[] = [
  {
    chainId: 56,
    decimals: 18,
    symbol: "CAKE",
    name: "PancakeSwap Token",
    isNative: false,
    isToken: true,
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    logoURI: "https://s2.coinmarketcap.com/static/img/coins/200x200/7186.png",
  },
  {
    chainId: 56,
    decimals: 18,
    symbol: "BNB",
    name: "Binance Chain Native Token",
    isNative: true,
    isToken: false,
    logoURI:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9cUvoCvmCXO4pNHvnREHBCKW30U-BVxKfg&s",
  },
  {
    chainId: 56,
    decimals: 18,
    symbol: "USDC",
    name: "Binance-Peg USD Coin",
    isNative: false,
    isToken: true,
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    logoURI: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
  },
];
