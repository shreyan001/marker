import { parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { swapTokens, liquidityPools } from '@/utils/tradingUtils';
import {  useWalletClient, useAccount } from 'wagmi';
import { publicClient } from './siwe';
import { erc20Abi } from 'viem';

const SWAP_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS as `0x${string}`;

const swapRouterABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    inputs: [{
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMinimum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' }
      ]
    }],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable'
  }
] as const;

const QUOTER_ADDRESS = process.env.NEXT_PUBLIC_QUOTER_ADDRESS as `0x${string}`;

const quoterABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' }
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export const useSwap = () => {

  const { data: walletClient } = useWalletClient();
  const { address: walletAddress } = useAccount();

  const approveToken = async (
    tokenAddress: `0x${string}`,
    amount: bigint
  ): Promise<`0x${string}`> => {
    if (!walletClient || !walletAddress) throw new Error('Wallet not connected');

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [SWAP_ROUTER_ADDRESS, amount],
    });

    const hash = await walletClient.sendTransaction({
      to: tokenAddress,
      data,
      account: walletAddress,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  };

  const getPrice = async (
    inputAmount: string,
    slippageAmount: number,
    deadline: number,
    token0Symbol: string,
    token1Symbol: string
  ): Promise<[{ to: `0x${string}`; data: `0x${string}`; value: string }, string, string] | null> => {
    const pool = liquidityPools.find(
      (p: { token0: string; token1: string; fee: number }) => 
        (p.token0 === token0Symbol && p.token1 === token1Symbol) ||
        (p.token0 === token1Symbol && p.token1 === token0Symbol)
    );

    if (!pool) {
      console.error('No liquidity pool available for this token pair');
      return null;
    }

    const token0 = swapTokens.find(t => t.symbol === token0Symbol);
    const token1 = swapTokens.find(t => t.symbol === token1Symbol);

    if (!token0 || !token1) {
      console.error('Invalid token symbols');
      return null;
    }

    if (!token0?.contractAddress || !token1?.contractAddress) {
      console.error('Token contract addresses are undefined');
      return null;
    }

    const amountIn = parseUnits(inputAmount, token0.decimals);

    try {
      const quoteResult = await publicClient.readContract({
        address: QUOTER_ADDRESS,
        abi: quoterABI,
        functionName: 'quoteExactInputSingle',
        args: [token0.contractAddress, token1.contractAddress, pool.fee, amountIn, BigInt(0)]
      });

      const amountOut = quoteResult;
      const quoteAmountOut = formatUnits(amountOut, token1.decimals);
      const ratio = (parseFloat(inputAmount) / parseFloat(quoteAmountOut)).toFixed(3);

      const params = {
        tokenIn: token0.contractAddress,
        tokenOut: token1.contractAddress,
        fee: pool.fee,
        recipient: walletAddress as `0x${string}`,
        deadline: BigInt(Math.floor(Date.now() / 1000) + deadline),
        amountIn,
        amountOutMinimum: BigInt(Math.floor(Number(amountOut) * (1 - slippageAmount / 100))),
        sqrtPriceLimitX96: BigInt(0)
      };

      const data = encodeFunctionData({
        abi: swapRouterABI,
        functionName: 'exactInputSingle',
        args: [params],
      });

      const transaction = {
        to: SWAP_ROUTER_ADDRESS,
        data,
        value: '0'
      };

      return [transaction, quoteAmountOut, ratio];
    } catch (error) {
      console.error('Error getting quote:', error);
      return null;
    }
  };

  const runSwap = async (
    transaction: { to: `0x${string}`; data: `0x${string}`; value: string }
  ): Promise<`0x${string}`> => {
    if (!walletClient || !walletAddress) throw new Error('Wallet not connected');

    const hash = await walletClient.sendTransaction({
      ...transaction,
      account: walletAddress,
      value: BigInt(transaction.value),
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  };

  return { getPrice, runSwap, approveToken };
};

