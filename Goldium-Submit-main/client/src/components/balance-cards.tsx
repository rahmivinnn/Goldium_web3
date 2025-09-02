import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useExternalWalletBalances } from '@/hooks/use-external-wallet-balances';
import { WalletStateManager } from '@/lib/wallet-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoldBalance } from '@/hooks/use-gold-balance';
import logoImage from '@assets/k1xiYLna_400x400-removebg-preview_1754140723127.png';
import { SolanaIcon } from '@/components/solana-icon';

export function BalanceCards() {
  const { data: balances, isLoading } = useExternalWalletBalances();
  const goldBalance = useGoldBalance();
  const [walletState, setWalletState] = useState(WalletStateManager.getState());
  
  // Subscribe to global wallet state
  useEffect(() => {
    const unsubscribe = WalletStateManager.subscribe(() => {
      setWalletState(WalletStateManager.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Show external wallet balance if connected, otherwise use self-contained balance
  const currentBalance = (walletState.connected && walletState.address && walletState.balance > 0) ? walletState.balance : (balances?.sol || 0);
  
  console.log('Balance Cards Global State Debug:', {
    connected: walletState.connected,
    selectedWallet: walletState.selectedWallet,
    walletBalance: walletState.balance,
    currentBalance: currentBalance,
    address: walletState.address,
    selfContainedBalance: balances?.sol
  });

  // Use same balance structure as Swap tab for consistency
  const safeBalances = {
    sol: currentBalance, // Direct balance from wallet state
    gold: goldBalance.balance, // User's actual GOLD balance from real service
    stakedGold: goldBalance.stakedBalance // User's actual staked amount from real service
  };

  // Skip refresh balance calls to avoid RPC errors
  // React.useEffect(() => {
  //   if (wallet.refreshBalance) {
  //     const timer = setTimeout(() => {
  //       wallet.refreshBalance();
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [wallet.refreshBalance]);
  
  // Show wallet info if external wallet is connected
  const walletInfo = walletState.connected && walletState.selectedWallet ? 
    ` (${walletState.selectedWallet.charAt(0).toUpperCase() + walletState.selectedWallet.slice(1)})` : '';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-defi-secondary/80 backdrop-blur-sm border-defi-accent/30">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* SOL Balance */}
      <Card className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                SOL Balance
              </h3>
              {walletInfo && (
                <p className="text-xs font-medium text-yellow-300/70 mt-1 tracking-wider uppercase">
                  {walletInfo.replace(/[()]/g, '')}
                </p>
              )}
            </div>
            <div className="relative">
              <SolanaIcon size={32} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/30 transition-all duration-300"></div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-black text-white tracking-tight font-mono">
              {currentBalance.toFixed(4)}
              <span className="text-lg font-normal text-yellow-300/80 ml-2">SOL</span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-300">
                ≈ ${(currentBalance * 195.5).toFixed(2)} USD
              </p>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GOLD Balance */}
      <Card className="group bg-gradient-to-br from-amber-900/90 to-yellow-900/90 backdrop-blur-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent tracking-tight">
                GOLD Balance
              </h3>
              <p className="text-xs font-medium text-yellow-300/70 mt-1 tracking-wider uppercase">
                GOLDIUM TOKEN
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="GOLD Token" 
                  className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="text-yellow-400 text-2xl font-bold hidden">🥇</div>
              </div>
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/30 transition-all duration-300"></div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-black text-white tracking-tight font-mono">
              {safeBalances.gold.toFixed(2)}
              <span className="text-lg font-normal text-yellow-300/80 ml-2">GOLD</span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-300">
                ≈ ${(safeBalances.gold * 20).toFixed(2)} USD
              </p>
              {goldBalance.isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              ) : (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staked GOLD */}
      <Card className="group bg-gradient-to-br from-emerald-900/90 to-green-900/90 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent tracking-tight">
                Staked GOLD
              </h3>
              <p className="text-xs font-medium text-emerald-300/70 mt-1 tracking-wider uppercase">
                {goldBalance.stakingInfo.apy}% APY REWARDS
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="Staked GOLD" 
                  className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 text-emerald-400 text-sm animate-pulse">🔒</div>
              </div>
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl group-hover:bg-emerald-400/30 transition-all duration-300"></div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-black text-white tracking-tight font-mono">
              {safeBalances.stakedGold.toFixed(2)}
              <span className="text-lg font-normal text-emerald-300/80 ml-2">GOLD</span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-300">
                ≈ ${(safeBalances.stakedGold * 20).toFixed(2)} USD
              </p>
              {goldBalance.isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              ) : (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
