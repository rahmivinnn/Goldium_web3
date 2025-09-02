import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { solscanTracker } from '@/lib/solscan-tracker';
import { useSolanaWallet } from './solana-wallet-provider';
import { useSelfContainedBalances } from '@/hooks/use-self-contained-balances';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useInstantBalance } from '@/hooks/use-instant-balance';
import { useToast } from '@/hooks/use-toast';
import { TransactionSuccessModal } from './transaction-success-modal';
import { SOL_TO_GOLD_RATE, GOLD_TO_SOL_RATE, SOLSCAN_BASE_URL } from '@/lib/constants';
import { autoSaveTransaction } from '@/lib/historyUtils';
import logoImage from '@assets/k1xiYLna_400x400-removebg-preview_1754275575442.png';

export function SelfContainedSwapTab() {
  const walletContext = useSolanaWallet();
  const { connected, swapService, refreshTransactionHistory } = walletContext;
  const { balances, refetch } = useSelfContainedBalances();
  const externalWallet = useExternalWallets();
  const instantBalance = useInstantBalance();
  const { toast } = useToast();
  
  const [fromToken, setFromToken] = useState<'SOL' | 'GOLD'>('SOL');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<{
    type: 'swap';
    amount: number;
    tokenFrom: string;
    tokenTo: string;
    txSignature: string;
  } | null>(null);

  // Auto-refresh balances every 5 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      if (connected) {
        refetch();
        console.log('🔄 Auto-refreshing balances...');
      }
    }, 5000);

    return () => clearInterval(autoRefreshInterval);
  }, [connected, refetch]);

  // Auto-detect best swap direction based on balances
  useEffect(() => {
    if (connected && !fromAmount) {
      const solBalance = getTokenBalance('SOL');
      const goldBalance = getTokenBalance('GOLD');
      
      // Auto-select token with higher balance for better UX
      if (solBalance > goldBalance && fromToken !== 'SOL') {
        setFromToken('SOL');
        console.log('🔄 Auto-switched to SOL (higher balance)');
      } else if (goldBalance > solBalance && fromToken !== 'GOLD') {
        setFromToken('GOLD');
        console.log('🔄 Auto-switched to GOLD (higher balance)');
      }
    }
  }, [connected, balances, fromToken, fromAmount]);

  // Auto-connect external wallet if available
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (!externalWallet.connected && !connected) {
        // Check for available wallets
        const availableWallets = ['phantom', 'solflare', 'trustwallet'];
        
        for (const wallet of availableWallets) {
          if ((window as any)[wallet]?.solana) {
            try {
              console.log(`🔄 Auto-connecting to ${wallet}...`);
              // Auto-connect logic would go here
              break;
            } catch (error) {
              console.log(`Failed to auto-connect to ${wallet}:`, error);
            }
          }
        }
      }
    };

    // Auto-connect after 2 seconds
    const timer = setTimeout(autoConnectWallet, 2000);
    return () => clearTimeout(timer);
  }, [externalWallet.connected, connected]);

  // Calculate exchange rate based on real market data
  const exchangeRate = fromToken === 'SOL' ? SOL_TO_GOLD_RATE : GOLD_TO_SOL_RATE;
  const slippage = 0.5; // 0.5% slippage
  
  // Display exchange rate info
  const displayRate = fromToken === 'SOL' 
    ? `1 SOL = ${Math.round(SOL_TO_GOLD_RATE).toLocaleString()} GOLD`
    : `1 GOLD = ${GOLD_TO_SOL_RATE.toFixed(8)} SOL`;

  // Auto-validate and suggest optimal amounts
  useEffect(() => {
    if (fromAmount && Number(fromAmount) > 0) {
      const amount = Number(fromAmount);
      const balance = getTokenBalance(fromToken);
      const feeBuffer = fromToken === 'SOL' ? 0.001 : 0;
      
      // Auto-suggest optimal amount if current amount is too high
      if (fromToken === 'SOL' && (amount + feeBuffer) > balance) {
        const optimalAmount = Math.max(0, balance - feeBuffer - 0.0001);
        if (optimalAmount > 0) {
          console.log(`💡 Auto-suggesting optimal amount: ${optimalAmount.toFixed(6)} ${fromToken}`);
          // Don't auto-change, just log suggestion
        }
      }
    }
  }, [fromAmount, fromToken, balances]);

  // Calculate amounts with auto-validation
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const amount = Number(value);
    if (amount > 0) {
      const calculated = amount * exchangeRate;
      setToAmount(calculated.toFixed(6));
      
      // Auto-validate and show warnings
      const balance = getTokenBalance(fromToken);
      const feeBuffer = fromToken === 'SOL' ? 0.001 : 0;
      
      if (fromToken === 'SOL' && (amount + feeBuffer) > balance) {
        console.log(`⚠️ Amount exceeds balance: ${amount} > ${balance - feeBuffer}`);
      }
    } else {
      setToAmount('');
    }
  };

  // Auto-swap direction based on market conditions
  const handleSwapDirection = () => {
    setFromToken(fromToken === 'SOL' ? 'GOLD' : 'SOL');
    setFromAmount('');
    setToAmount('');
    
    // Auto-suggest amount based on new token
    const newBalance = getTokenBalance(fromToken === 'SOL' ? 'GOLD' : 'SOL');
    if (newBalance > 0) {
      const suggestedAmount = Math.min(newBalance * 0.1, newBalance); // 10% of balance
      console.log(`💡 Auto-suggested amount: ${suggestedAmount.toFixed(6)} ${fromToken === 'SOL' ? 'GOLD' : 'SOL'}`);
    }
  };

  // Use INSTANT balance that updates immediately when switching wallets
  const getTokenBalance = (token: 'SOL' | 'GOLD') => {
    if (token === 'SOL') {
      // Debug the wallet states
      console.log('WALLET DEBUG:', {
        externalConnected: externalWallet.connected,
        externalAddress: externalWallet.address,
        externalBalance: externalWallet.balance,
        externalWallet: externalWallet.selectedWallet,
        selfContainedBalance: balances.sol
      });
      
      // Show external wallet balance if connected, otherwise self-contained balance
      if (externalWallet.connected && externalWallet.address && externalWallet.balance > 0) {
        console.log(`✅ Using EXTERNAL wallet balance: ${externalWallet.balance} SOL`);
        return externalWallet.balance;
      }
      
      console.log(`✅ Using SELF-CONTAINED wallet balance: ${balances.sol} SOL`);
      return balances.sol;
    }
    
    console.log(`✅ Using GOLD balance: ${balances.gold} GOLD`);
    return balances.gold || 0;
  };
  
  // Display current wallet source for transparency
  const balanceSource = externalWallet.connected && externalWallet.address ? 
    `${externalWallet.selectedWallet} - ${externalWallet.address.slice(0, 8)}...` : 
    'Self-contained wallet';

  // Execute swap
  const handleSwap = async () => {
    if (!connected || !fromAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter an amount to swap",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(fromAmount);
    const balance = getTokenBalance(fromToken);
    const feeBuffer = fromToken === 'SOL' ? 0.001 : 0; // Reserve SOL for transaction fees

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive"
      });
      return;
    }

    // Strict balance validation - no demo mode
    if (fromToken === 'SOL' && (amount + feeBuffer) > balance) {
      toast({
        title: "Insufficient Balance",
        description: `Need ${(amount + feeBuffer).toFixed(6)} SOL (including fees) but only have ${balance.toFixed(6)} SOL`,
        variant: "destructive"
      });
      return;
    } else if (fromToken === 'GOLD' && amount > balance) {
      toast({
        title: "Insufficient Balance", 
        description: `Insufficient GOLD balance. You have ${balance.toFixed(4)} GOLD`,
        variant: "destructive"
      });
      return;
    }

    // Require external wallet for SOL swaps
    if (fromToken === 'SOL' && !externalWallet.connected) {
      toast({
        title: "External Wallet Required",
        description: "Please connect an external wallet (Phantom, Solflare, etc.) to swap SOL",
        variant: "destructive"
      });
      return;
    }

    // Require minimum balance for GOLD swaps
    if (fromToken === 'GOLD' && balance === 0) {
      toast({
        title: "No GOLD Balance",
        description: "You need GOLD tokens to swap. Try swapping SOL to GOLD first.",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);

    try {
      console.log(`Starting swap: ${amount} ${fromToken}, wallet balance: ${balance.toFixed(6)} SOL`);
      
      // Pass external wallet info to swap service for REAL transactions
      if (externalWallet.connected) {
        const externalWalletData = {
          ...externalWallet,
          walletInstance: (window as any).phantom?.solana || (window as any).solflare || (window as any).trustwallet?.solana
        };
        swapService.setExternalWallet(externalWalletData);
        console.log(`Using REAL external wallet: ${externalWallet.address} with ${externalWallet.balance} SOL`);
      }
      
      let result;
      
      if (fromToken === 'SOL') {
        result = await swapService.swapSolToGold(amount);
      } else {
        result = await swapService.swapGoldToSol(amount);
      }

      if (result.success && result.signature) {
        setLastTxId(result.signature);
        
        // Track transaction for Solscan
        solscanTracker.trackTransaction({
          signature: result.signature,
          type: 'swap',
          token: fromToken,
          amount
        });
        
        // Show contract address info for GOLD swaps
        if (fromToken === 'GOLD') {
          solscanTracker.showContractInfo('GOLD');
        }
        
        console.log('🔗 Swap Transaction on Solscan:', solscanTracker.getSolscanUrl(result.signature));
        
        // Set transaction details for success modal
        setCompletedTransaction({
          type: 'swap',
          amount,
          tokenFrom: fromToken,
          tokenTo: fromToken === 'SOL' ? 'GOLD' : 'SOL',
          txSignature: result.signature
        });
        setShowSuccessModal(true);

        // Auto-save transaction to new history system
        try {
          const walletAddress = externalWallet.connected ? externalWallet.address : (connected ? walletContext.publicKey?.toString() : null);

          if (walletAddress) {
            // Calculate amounts for the new history format
            const amountSOL = fromToken === 'SOL' ? Number(fromAmount) : Number(toAmount);
            const amountGOLD = fromToken === 'GOLD' ? Number(fromAmount) : Number(toAmount);

            // Auto-save transaction with new format
            autoSaveTransaction(
              walletAddress,
              result.signature,
              'swap',
              amountSOL,
              amountGOLD,
              'success'
            );

            // Refresh transaction history in wallet provider
            refreshTransactionHistory();
          }
        } catch (error) {
          console.error('Failed to auto-save transaction:', error);
        }

        // Update GOLD balance in old transaction history system for compatibility
        try {
          const { transactionHistory } = await import('../lib/transaction-history');
          const walletAddress = externalWallet.connected ? externalWallet.address : (connected ? walletContext.publicKey?.toString() : null);

          if (walletAddress) {
            transactionHistory.setCurrentWallet(walletAddress);

            if (fromToken === 'SOL') {
              // User swapped SOL to GOLD - add GOLD to their balance
              const goldReceived = Number(toAmount);
              transactionHistory.addGoldTransaction('swap_receive', goldReceived, result.signature);
              console.log(`🪙 Added ${goldReceived} GOLD to user balance from swap`);
            } else {
              // User swapped GOLD to SOL - deduct GOLD from their balance
              const goldSpent = Number(fromAmount);
              transactionHistory.addGoldTransaction('swap_send', goldSpent, result.signature);
              console.log(`🪙 Deducted ${goldSpent} GOLD from user balance for swap`);
            }
          }
        } catch (error) {
          console.error('Failed to update GOLD balance:', error);
        }

        // Auto-clear form and refresh
        setFromAmount('');
        setToAmount('');
        
        // Auto-refresh balances multiple times for accuracy
        refetch();
        setTimeout(() => refetch(), 1000);
        setTimeout(() => refetch(), 3000);
        setTimeout(() => refetch(), 5000);
        
        // Auto-show success modal after 1 second
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 1000);
        
        // Auto-hide success modal after 5 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 5000);
        
      } else {
        throw new Error(result.error || 'Swap failed');
      }
      
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

  const fromBalance = getTokenBalance(fromToken);
  const isValidAmount = fromAmount && Number(fromAmount) > 0 && Number(fromAmount) <= fromBalance;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* From Token */}
      <div className="space-y-4">
        <label className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent tracking-tight">From</label>
        <Card className="group bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-400/40 hover:border-yellow-400/70 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={handleSwapDirection}
              >
                {fromToken === 'SOL' ? (
                  <span className="text-yellow-400 text-lg">◎</span>
                ) : (
                  <img 
                    src={logoImage} 
                    alt="GOLD" 
                    className="w-6 h-6 drop-shadow-lg"
                  />
                )}
                <span className="ml-2 font-bold">{fromToken}</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-right">
                <p className="text-xs font-medium text-yellow-300/70 uppercase tracking-wider">Available Balance</p>
                <p className="text-sm font-bold text-white font-mono">
                  {externalWallet.connected ? 
                    (fromToken === 'SOL' ? externalWallet.balance.toFixed(4) : balances.gold.toFixed(2)) : 
                    fromBalance.toFixed(fromToken === 'SOL' ? 4 : 2)
                  } {fromToken}
                </p>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="bg-gradient-to-r from-white to-gray-50 text-black text-3xl font-black border-none p-4 h-auto placeholder:text-gray-400 rounded-xl font-mono tracking-tight"
            />
          </CardContent>
        </Card>
      </div>

      {/* Swap Direction Arrow */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-black/70 border-yellow-400/40 hover:border-yellow-400/70"
          onClick={handleSwapDirection}
        >
          <ArrowUpDown className="h-4 w-4 text-yellow-400" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-4">
        <label className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent tracking-tight">To</label>
        <Card className="group bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-400/40 text-white font-semibold px-4 py-2 rounded-xl opacity-80 cursor-not-allowed"
                disabled
              >
                {fromToken === 'GOLD' ? (
                  <span className="text-emerald-400 text-lg">◎</span>
                ) : (
                  <img 
                    src={logoImage} 
                    alt="GOLD" 
                    className="w-6 h-6 drop-shadow-lg"
                  />
                )}
                <span className="ml-2 font-bold">{fromToken === 'GOLD' ? 'SOL' : 'GOLD'}</span>
              </Button>
              <div className="text-right">
                <p className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider">Current Balance</p>
                <p className="text-sm font-bold text-white font-mono">
                  {fromToken === 'GOLD' ? balances.sol.toFixed(4) : balances.gold.toFixed(2)} {fromToken === 'GOLD' ? 'SOL' : 'GOLD'}
                </p>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="bg-gradient-to-r from-emerald-900/80 to-green-900/80 border border-emerald-400/30 text-white text-3xl font-black p-4 h-auto placeholder:text-emerald-300/50 rounded-xl font-mono tracking-tight cursor-not-allowed backdrop-blur-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Swap Details */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-tight mb-4">Swap Details</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Exchange Rate</span>
            <span className="text-sm font-bold text-white font-mono">
              {fromToken === 'SOL' 
                ? `1 SOL = ${exchangeRate.toLocaleString()} GOLD`
                : `1 GOLD = ${exchangeRate.toFixed(8)} SOL`
              }
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Slippage Tolerance</span>
            <span className="text-sm font-bold text-emerald-400">{slippage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Network Fee</span>
            <span className="text-sm font-bold text-blue-400 font-mono">~0.000005 SOL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Treasury</span>
            <span className="text-sm font-bold text-yellow-400 font-mono">APkB...pump</span>
          </div>
        </CardContent>
      </Card>

      {/* Swap Button */}
      <Button
        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 py-6 font-black text-lg text-black transition-all duration-300 transform hover:scale-[1.02] shadow-2xl hover:shadow-yellow-500/25 rounded-xl border border-yellow-400/30 hover:border-yellow-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={handleSwap}
        disabled={!connected || !isValidAmount || isSwapping}
      >
        {isSwapping ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            <span>Processing Swap...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="tracking-wide">Swap {fromToken} → {fromToken === 'SOL' ? 'GOLD' : 'SOL'}</span>
          </div>
        )}
      </Button>

      {/* Last Transaction */}
      {lastTxId && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 mb-2">Last swap transaction:</p>
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

      {/* Success Modal */}
      {completedTransaction && (
        <TransactionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          transactionType={completedTransaction.type}
          amount={completedTransaction.amount}
          tokenFrom={completedTransaction.tokenFrom}
          tokenTo={completedTransaction.tokenTo}
          txSignature={completedTransaction.txSignature}
        />
      )}
    </div>
  );
}