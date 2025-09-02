import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { useTokenAccounts } from '@/hooks/use-token-accounts';
import { useWallet } from '@/components/multi-wallet-provider';
import { useToast } from '@/hooks/use-toast';
import { solanaService } from '@/lib/solana';
import {
  GOLDIUM_TOKEN_ADDRESS,
  SOL_MINT_ADDRESS_STRING,
  DEFAULT_SLIPPAGE,
  SOLSCAN_BASE_URL
} from '@/lib/constants';
import { autoSaveTransaction } from '@/lib/historyUtils';

export function SwapTab() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState<'SOL' | 'GOLD'>('SOL');
  const [slippage] = useState(DEFAULT_SLIPPAGE);
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  
  const { connected, wallet, publicKey } = useWallet();
  const { balances, refetch } = useTokenAccounts();
  const { toast } = useToast();

  const exchangeRate = fromToken === 'SOL' ? 12.43 : 0.08;
  const fromBalance = fromToken === 'SOL' ? balances.sol : balances.gold;

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const estimated = Number(value) * exchangeRate;
      setToAmount(estimated.toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const handleSwapDirection = () => {
    setFromToken(fromToken === 'SOL' ? 'GOLD' : 'SOL');
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !connected || !wallet) {
      toast({
        title: "Connection Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(fromAmount);
    if (amount <= 0 || amount > fromBalance) {
      toast({
        title: "Invalid Amount",
        description: `Please enter a valid amount (max: ${fromBalance.toFixed(4)} ${fromToken})`,
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      const fromMint = fromToken === 'SOL' ? SOL_MINT_ADDRESS_STRING : GOLDIUM_TOKEN_ADDRESS;
      const toMint = fromToken === 'SOL' ? GOLDIUM_TOKEN_ADDRESS : SOL_MINT_ADDRESS_STRING;

      console.log(`Executing real swap: ${amount} ${fromToken} -> ${fromToken === 'SOL' ? 'GOLD' : 'SOL'}`);
      
      const txId = await solanaService.executeSwap(
        fromMint,
        toMint,
        amount,
        slippage,
        wallet
      );
      
      setLastTxId(txId);

      // Auto-save transaction to history
      try {
        if (publicKey) {
          const walletAddress = publicKey.toString();

          // Calculate amounts for the new history format
          const amountSOL = fromToken === 'SOL' ? amount : Number(toAmount);
          const amountGOLD = fromToken === 'GOLD' ? amount : Number(toAmount);

          // Auto-save transaction with new format
          autoSaveTransaction(
            walletAddress,
            txId,
            'swap',
            amountSOL,
            amountGOLD,
            'success'
          );
        }
      } catch (error) {
        console.error('Failed to auto-save transaction:', error);
      }

      setFromAmount('');
      setToAmount('');

      toast({
        title: "Swap Successful! 🎉",
        description: (
          <div className="space-y-2">
            <p>Your swap transaction was successful!</p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${txId}`, '_blank')}
              >
                View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ),
      });

      // Refresh balances after successful swap
      setTimeout(() => refetch(), 2000);
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      toast({
        title: "Swap Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const isValidAmount = fromAmount && Number(fromAmount) > 0 && Number(fromAmount) <= fromBalance;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* From Token */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">From</label>
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-galaxy-blue/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <Button
                variant="outline"
                className="bg-galaxy-button border-galaxy-purple/30 hover:border-galaxy-blue/50 text-white"
                onClick={handleSwapDirection}
              >
                <span className={fromToken === 'SOL' ? 'text-galaxy-blue' : 'text-gold-primary'}>
                  {fromToken === 'SOL' ? '◎' : '⚡'}
                </span>
                <span className="ml-2">{fromToken}</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
              <span className="text-sm text-galaxy-accent">
                Balance: {fromBalance.toFixed(4)}
              </span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="bg-transparent text-2xl font-semibold border-none p-0 h-auto text-galaxy-bright placeholder:text-galaxy-accent"
            />
          </CardContent>
        </Card>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="icon"
          className="bg-defi-accent hover:bg-defi-accent/80 border-defi-accent rounded-full transition-all duration-200 hover:rotate-180"
          onClick={handleSwapDirection}
        >
          <ArrowUpDown className="h-4 w-4 text-gray-300" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">To</label>
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-gold-primary/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <Button
                variant="outline"
                className="bg-galaxy-button/60 border-galaxy-purple/30 hover:border-gold-primary/50 text-white opacity-80"
                disabled
              >
                <span className={fromToken === 'GOLD' ? 'text-galaxy-blue' : 'text-gold-primary'}>
                  {fromToken === 'GOLD' ? '◎' : '⚡'}
                </span>
                <span className="ml-2">{fromToken === 'GOLD' ? 'SOL' : 'GOLD'}</span>
              </Button>
              <span className="text-sm text-galaxy-accent">
                Balance: {fromToken === 'GOLD' ? balances.sol.toFixed(4) : balances.gold.toFixed(4)}
              </span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="bg-transparent text-2xl font-semibold border-none p-0 h-auto text-galaxy-bright placeholder:text-galaxy-accent"
            />
          </CardContent>
        </Card>
      </div>

      {/* Swap Details */}
      <Card className="bg-galaxy-card/60 border-galaxy-purple/20">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-galaxy-accent">Rate</span>
            <span className="text-galaxy-bright">1 {fromToken} = {exchangeRate} {fromToken === 'SOL' ? 'GOLD' : 'SOL'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-galaxy-accent">Slippage</span>
            <span className="text-galaxy-bright">{slippage}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-galaxy-accent">Network Fee</span>
            <span className="text-galaxy-bright">~0.000005 SOL</span>
          </div>
        </CardContent>
      </Card>

      {/* Swap Button */}
      <Button
        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 py-4 font-semibold text-black transition-all duration-200 transform hover:scale-105 shadow-lg"
        onClick={handleSwap}
        disabled={!connected || !isValidAmount || isSwapping}
      >
        {isSwapping ? 'Swapping...' : 'Swap Tokens'}
      </Button>
      
      {lastTxId && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 mb-2">Last transaction:</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${lastTxId}`, '_blank')}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
