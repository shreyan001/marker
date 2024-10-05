import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface Token {
  symbol: string;
  amount: string;
  logo: string;
}

interface SwapDetails {
  fromToken: Token;
  toToken: Token;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string | null;
  swapDetails: SwapDetails | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, txHash, swapDetails }) => {
  const truncateHash = (hash: string) => {
    return hash.slice(0, 6) + '...' + hash.slice(-4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-4 border-black rounded-3xl max-w-sm mx-auto p-0">
        <DialogHeader className="bg-[#32CD32] p-3 border-b-2 border-black">
          <DialogTitle className="text-lg font-bold text-black">Transaction Status</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {!txHash ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-20 h-20 animate-spin text-[#32CD32] stroke-[1.5]" />
              <p className="mt-4 text-sm font-semibold text-black">Transaction in progress...</p>
            </div>
          ) : (
            <div className="bg-white p-3 rounded-lg border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
              <p className="text-sm font-semibold text-green-600">Transaction successful!</p>
              <p className="mt-2 text-xs">
                Tx Hash:{' '}
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {truncateHash(txHash)}
                </a>
              </p>
              {swapDetails && (
                <div className="mt-3">
                  <p className="text-xs font-semibold">Tokens Transferred:</p>
                  <div className="flex items-center justify-between mt-1 bg-gray-100 p-2 rounded border border-gray-200">
                    <TokenInfo token={swapDetails.fromToken} />
                    <svg className="w-4 h-4 mx-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <TokenInfo token={swapDetails.toToken} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TokenInfo: React.FC<{ token: Token }> = ({ token }) => (
  <div className="flex items-center">
    <Image src={token.logo} alt={token.symbol} width={16} height={16} className="mr-1" />
    <span className="text-xs font-medium">{token.amount} {token.symbol}</span>
  </div>
);

export default TransactionModal;
