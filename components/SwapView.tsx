'use client'
import React, { useState, useRef, useCallback,useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Fuel } from 'lucide-react';
import ConfigModal from '../ui/configModal';
import Image from 'next/image';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useBalance,  } from 'wagmi';
import { swapTokens } from '@/utils/tradingUtils';
import { useSwap } from '@/lib/handleSwap';
import { erc20Abi } from 'viem';
import { publicClient } from '@/lib/siwe';
import TransactionModal from '../ui/TransactionModal';

type SwapDetails = {
  fromToken: { symbol: string; amount: string; logo: string };
  toToken: { symbol: string; amount: string; logo: string };
};

export default function SwapView() {
  const { address, isConnected } = useAccount();

  const [slippageAmount, setSlippageAmount] = useState('1.0');
  const [deadlineMinutes, setDeadlineMinutes] = useState('10');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [token0, setToken0] = useState('ETH');
  const [token1, setToken1] = useState('');
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const SWAP_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS as `0x${string}`
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [gasPriceUSD, setGasPriceUSD] = useState<string | null>(null);
  const ETH_PRICE_USD = 2300; // Assuming 1 ETH = $2300 USD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [swapDetails, setSwapDetails] = useState<SwapDetails | null>(null);

  const formatBalance = (balance: bigint, decimals: number) => {
    return Number(formatUnits(balance, decimals)).toFixed(2);
  };

  const { data: token0Balance } = useBalance({
    address,
    token: token0 === 'ETH' ? undefined : swapTokens.find(t => t.symbol === token0)?.contractAddress as `0x${string}`,
  });

  const { data: token1Balance } = useBalance({
    address,
    token: token1 ? swapTokens.find(t => t.symbol === token1)?.contractAddress as `0x${string}` : undefined,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsConfigModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchGasPrice = async () => {
      const price = await publicClient.getGasPrice();
      const priceInGwei = Number(formatUnits(price, 9)).toFixed(2);
      setGasPrice(priceInGwei);
      
      // Calculate gas price in USD
      const priceInEth = Number(formatUnits(price, 18));
      const priceInUSD = (priceInEth * ETH_PRICE_USD * 21000).toFixed(2); // Assuming standard gas limit of 21000
      setGasPriceUSD(priceInUSD);
    };
    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 150000); 
    return () => clearInterval(interval);
  }, []);

  const { getPrice, runSwap, approveToken } = useSwap();

  const calculateQuote = useCallback(async (amount: string) => {
    if (!isConnected || !token0 || !token1 || !amount) return;

    setIsLoading(true);
    try {
      const result = await getPrice(
        amount,
        parseFloat(slippageAmount),
        parseInt(deadlineMinutes) * 60,
        token0,
        token1
      );

      if (result) {
        const [, quoteAmountOut, ratio] = result;
        setToken1Amount(quoteAmountOut);
        setExchangeRate(ratio);
      }
    } catch (error) {
      console.error('Error calculating quote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, token0, token1, slippageAmount, deadlineMinutes, getPrice]);

  const handleToken0AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setToken0Amount(newAmount);
    calculateQuote(newAmount);
  };

  const handleToken0Select = (value: string) => {
    setToken0(value);
    if (token0Amount && token1) calculateQuote(token0Amount);
  };

  const handleToken1Select = (value: string) => {
    setToken1(value);
    if (token0Amount && token0) calculateQuote(token0Amount);
  };

  const handleBlur = () => {
    if (token0Amount && token0 && token1) calculateQuote(token0Amount);
  };

  const handleMaxToken0 = () => {
    if (token0Balance) {
      setToken0Amount(formatUnits(token0Balance.value, token0Balance.decimals));
    }
  };

  const handleMaxToken1 = () => {
    if (token1Balance) {
      setToken1Amount(formatUnits(token1Balance.value, token1Balance.decimals));
    }
  };

  const handleSlippageChange = (value: string) => {
    setSlippageAmount(value);
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineMinutes(value);
  };

  const handleSwap = async () => {
    setIsModalOpen(true);
    try {
      if (!isConnected || !token0 || !token1 || !token0Amount) return;

      const token0Data = swapTokens.find(t => t.symbol === token0);
      if (!token0Data) throw new Error('Token not found');

      const amountIn = parseUnits(token0Amount, 18);

      // Check allowance
      const allowance = await publicClient.readContract({
        address: token0Data.contractAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address as `0x${string}`, SWAP_ROUTER_ADDRESS],
      });

      if (allowance < amountIn) {
        console.log('Insufficient allowance. Approving tokens...');
        await approveToken(token0Data.contractAddress, amountIn);
      }

      const result = await getPrice(
        token0Amount,
        parseFloat(slippageAmount),
        parseInt(deadlineMinutes) * 60,
        token0,
        token1
      );

      if (!result) {
        console.error('Failed to get swap quote');
        return;
      }

      const [transaction, quoteAmountOut, ratio] = result;
      console.log(`Estimated output: ${quoteAmountOut} ${token1}`);
      console.log(`Exchange rate: 1 ${token0} = ${ratio} ${token1}`);

      const txHash = await runSwap(transaction);
      console.log(`Swap transaction hash: ${txHash}`);
      setTxHash(txHash);
      setSwapDetails({
        fromToken: { symbol: token0, amount: token0Amount, logo: token0Data.image },
        toToken: { symbol: token1, amount: quoteAmountOut, logo: swapTokens.find(t => t.symbol === token1)?.image || '' },
      });
    } catch (error) {
      console.error('Swap failed:', error);
      setTxHash(null);
    }
    
  };

  return (
    <Card className="bg-white border-2 border-black shadow-[0_10px_20px_rgba(0,0,0,0.1)] max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Swap</h2>
          <div className="relative" ref={modalRef}>
            <button className="text-gray-600 hover:text-black"
              onClick={() => setIsConfigModalOpen(!isConfigModalOpen)}
            >
              <Settings className="h-5 w-5" />
            </button>

            <ConfigModal 
              isOpen={isConfigModalOpen}
              slippageAmount={slippageAmount}
              deadlineMinutes={deadlineMinutes}
              onSlippageChange={handleSlippageChange}
              onDeadlineChange={handleDeadlineChange}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between">
              <span className="text-gray-600">Sell</span>
              <span>{isConnected && token0Balance ? `${formatBalance(token0Balance.value, token0Balance.decimals)} ${token0}` : '0.00 ETH'}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="relative w-1/2">
                <Input
                  className="bg-white border-2 border-black text-lg w-full pl-3 pr-10 py-2 shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_6px_8px_rgba(0,0,0,0.2)] transition-all duration-200"
                  placeholder="0"
                  type="number"
                  step="any"
                  min="0"
                  value={token0Amount}
                  onChange={handleToken0AmountChange}
                  onBlur={handleBlur}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-700 text-xs font-semibold"
                  onClick={handleMaxToken0}
                >
                  MAX
                </button>
              </div>
              <Select onValueChange={handleToken0Select} disabled={!isConnected} value={token0}>
                <SelectTrigger className="w-[120px] bg-white border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1">
                  <SelectValue>
                 
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {swapTokens.map((token) => (
                    <SelectItem key={token.contractAddress} value={token.symbol}>
                      <div className="flex items-center">
                        <Image src={token.image} alt={token.name} width={16} height={16} className="mr-2" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-gray-100 p-4 border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between">
              <span className="text-gray-600">Buy</span>
              <span>{isConnected && token1 && token1Balance ? formatBalance(token1Balance.value, token1Balance.decimals) : '0.00'} {token1}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="relative w-1/2">
                <Input
                  className="bg-white border-2 border-black text-lg w-full pl-3 pr-10 py-2 shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_6px_8px_rgba(0,0,0,0.2)] transition-all duration-200 read-only:bg-gray-100 read-only:cursor-default read-only:focus:shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)]"
                  placeholder="0"
                  type="number"
                  value={token1Amount}
                  readOnly
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-700 text-xs font-semibold"
                  onClick={handleMaxToken1}
                >
                  MAX
                </button>
              </div>
              <Select onValueChange={handleToken1Select} disabled={!isConnected}>
                <SelectTrigger className="w-[120px] bg-white border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {swapTokens.map((token) => (
                    <SelectItem key={token.contractAddress} value={token.symbol} disabled={token.symbol === token0}>
                      <div className="flex items-center">
                        <Image src={token.image} alt={token.name} width={16} height={16} className="mr-2" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 mt-4 mb-2">
          <span className="font-bold">
            {exchangeRate && `1 ${token0} = ${exchangeRate} ${token1}`}
          </span>
          <span className="flex items-center">
            <Fuel className="h-4 w-4 mr-1" />
            {gasPriceUSD ? (Number(gasPriceUSD) < 0.01 ? '<$0.01' : `$${gasPriceUSD}`) : 'Loading...'}
          </span>
        </div>
        <Button 
          className="w-full mt-2 bg-[#39FF14] text-black border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1"
          disabled={!isConnected || !token0 || !token1 || !token0Amount || isLoading}
          onClick={handleSwap}
        >
          {isConnected ? (isLoading ? 'Calculating...' : 'Swap') : 'Connect Wallet'}
        </Button>
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          txHash={txHash}
          swapDetails={swapDetails}
        />
      </CardContent>
    </Card>
  );
}
