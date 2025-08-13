export type Token = {
  _id: string;
  name: string;
  symbol: string;
  address?: `0x${string}`;
  chainId: number;
  decimals: number;
  logoURI: string;
  isNative?: boolean;
  isToken?: boolean;
  usdtPrice: string;
};

export const defaultTokens: Token[] = [
  {
    _id: "685bae1504e6648be04558b6",
    chainId: 56,
    decimals: 18,
    symbol: "CAKE",
    name: "PancakeSwap Token",
    isNative: false,
    isToken: true,
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    logoURI: "https://s2.coinmarketcap.com/static/img/coins/200x200/7186.png",
    usdtPrice: "2.19",
  },
  {
    _id: "685ba8e7a52713d3cfe44119",
    chainId: 56,
    decimals: 18,
    symbol: "BNB",
    name: "Binance Chain Native Token",
    isNative: true,
    isToken: false,
    logoURI:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9cUvoCvmCXO4pNHvnREHBCKW30U-BVxKfg&s",
    usdtPrice: "811.19",
  },
];
