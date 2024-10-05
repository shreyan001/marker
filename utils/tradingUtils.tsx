const USDT_USDC_500 = process.env.NEXT_PUBLIC_USDT_USDC_500 as `0x${string}`;

export const portfolioData = [
  { name: 'Jan', value: 10000 },
  { name: 'Feb', value: 15000 },
  { name: 'Mar', value: 30000 },
  { name: 'Apr', value: 25000 },
  { name: 'May', value: 18000 },
  { name: 'Jun', value: 22000 },
];

export const cryptoTokens = [
  {
    image: '/usdc.png', // Replace with actual image URL
    name: 'Ethereum',
    symbol: 'ETH',
    balance: 5.25,
    price: 1800.50
  },
  {
    image: '/wbtc.png', // Replace with actual image URL
    name: 'Bitcoin',
    symbol: 'BTC',
    balance: 0.5,
    price: 35000.00
  },
  {
    image: '/usdt.png', // Replace with actual image URL
    name: 'Tether',
    symbol: 'USDT',
    balance: 1500.00,
    price: 1.00
  },
  {
    image: '/vercel.svg', // Replace with actual image URL
    name: 'Cardano',
    symbol: 'ADA',
    balance: 200.00,
    price: 1.25
  },
  {
    image: '/vercel.svg', // Replace with actual image URL
    name: 'Solana',
    symbol: 'SOL',
    balance: 10.00,
    price: 35.75
  }
];

export const swapTokens = [
  {
    image: '/vercel.svg',
    name: 'Ethereum',
    symbol: 'ETH',
    contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    decimals: 18
  },
  {
    image: '/vercel.svg',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    contractAddress: process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`,
    decimals: 18
  },
  {
    image: '/usdt.png',
    name: 'Tether',
    symbol: 'USDT',
    contractAddress: process.env.NEXT_PUBLIC_TETHER_ADDRESS as `0x${string}`,
    decimals: 18
  },
  {
    image: '/wbtc.png',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    contractAddress: process.env.NEXT_PUBLIC_WRAPPED_BITCOIN_ADDRESS as `0x${string}`,
    decimals: 18
  },
];

export const liquidityPools = [
  {
    address: USDT_USDC_500,
    token0: 'USDT',
    token1: 'USDC',
    fee: 500
  }
];

export const scheduledOperations = [
  { id: 1, type: 'DCA', description: 'Buy 0.1 ETH every week', nextExecution: '2023-06-15 10:00 UTC' },
  { id: 2, type: 'Take Profit', description: 'Sell 50% of LINK when price reaches $30', condition: 'LINK >= $30' },
  { id: 3, type: 'Rebalance', description: 'Rebalance portfolio to 60% ETH, 30% BTC, 10% USDT', nextExecution: '2023-06-20 00:00 UTC' },
]

import { formatUnits } from 'viem';

export const formatBalance = (balance: bigint, decimals: number) => {
  return Number(formatUnits(balance, decimals)).toFixed(2);
};

export const getDefaultToken = () => swapTokens.find(t => t.symbol === 'ETH') || swapTokens[0];

console.log('swapTokens:', swapTokens);