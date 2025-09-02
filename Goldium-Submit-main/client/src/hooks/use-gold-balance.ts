import { useState, useEffect, useCallback } from 'react';
import { goldTokenService } from '../services/gold-token-service';
import { WalletStateManager } from '../lib/wallet-state';

export interface GoldBalanceState {
  balance: number;
  stakedBalance: number;
  totalValue: number;
  isLoading: boolean;
  error: string | null;
}

export function useGoldBalance() {
  const [goldState, setGoldState] = useState<GoldBalanceState>({
    balance: 0,
    stakedBalance: 0,
    totalValue: 0,
    isLoading: false,
    error: null
  });

  const walletState = WalletStateManager.getState();

  // Update GOLD balances
  const updateGoldBalances = useCallback(async () => {
    if (!walletState.connected || !walletState.address) {
      setGoldState({
        balance: 0,
        stakedBalance: 0,
        totalValue: 0,
        isLoading: false,
        error: null
      });
      return;
    }

    setGoldState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🪙 Fetching GOLD balances for wallet:', walletState.address);
      
      // First check transaction history for local balance tracking
      let balance = 0;
      let stakedBalance = 0;
      
      // Import transaction history dynamically to avoid circular dependency
      const { transactionHistory } = await import('../lib/transaction-history');
      
      // Set current wallet in transaction history
      transactionHistory.setCurrentWallet(walletState.address);
      
      const historyBalance = transactionHistory.getGoldBalance();
      const historyStaked = transactionHistory.getStakedGoldBalance();
      
      if (historyBalance > 0 || historyStaked > 0) {
        balance = historyBalance;
        stakedBalance = historyStaked;
        console.log(`✅ Using GOLD balances from transaction history: ${balance} GOLD, ${stakedBalance} staked`);
      } else {
        // Fetch from blockchain as fallback
        [balance, stakedBalance] = await Promise.all([
          goldTokenService.getGoldBalance(walletState.address),
          goldTokenService.getStakedGoldBalance(walletState.address)
        ]);
        console.log(`✅ GOLD balances from blockchain: ${balance} GOLD, ${stakedBalance} staked`);
      }

      const totalValue = (balance + stakedBalance) * 20; // $20 per GOLD

      setGoldState({
        balance,
        stakedBalance,
        totalValue,
        isLoading: false,
        error: null
      });
      
    } catch (error: any) {
      console.error('Failed to fetch GOLD balances:', error);
      setGoldState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch GOLD balances'
      }));
    }
  }, [walletState.connected, walletState.address]);

  // Transfer GOLD tokens
  const transferGold = useCallback(async (toAddress: string, amount: number) => {
    if (!walletState.connected) {
      throw new Error('Wallet not connected');
    }

    // Get wallet adapter for signing
    let walletAdapter: any = null;
    switch (walletState.selectedWallet) {
      case 'phantom':
        walletAdapter = (window as any).solana;
        break;
      case 'solflare':
        walletAdapter = (window as any).solflare;
        break;
      case 'backpack':
        walletAdapter = (window as any).backpack;
        break;
      case 'trust':
        walletAdapter = (window as any).trustwallet || (window as any).trust;
        break;
    }

    if (!walletAdapter) {
      throw new Error('Wallet adapter not found');
    }

    const signature = await goldTokenService.transferGold(walletAdapter, toAddress, amount);
    
    // Refresh balances after transfer
    setTimeout(updateGoldBalances, 1000);
    
    return signature;
  }, [walletState.connected, walletState.selectedWallet, updateGoldBalances]);

  // Stake GOLD tokens
  const stakeGold = useCallback(async (amount: number) => {
    if (!walletState.connected) {
      throw new Error('Wallet not connected');
    }

    let walletAdapter: any = null;
    switch (walletState.selectedWallet) {
      case 'phantom':
        walletAdapter = (window as any).solana;
        break;
      case 'solflare':
        walletAdapter = (window as any).solflare;
        break;
      case 'backpack':
        walletAdapter = (window as any).backpack;
        break;
      case 'trust':
        walletAdapter = (window as any).trustwallet || (window as any).trust;
        break;
    }

    if (!walletAdapter) {
      throw new Error('Wallet adapter not found');
    }

    const signature = await goldTokenService.stakeGold(walletAdapter, amount);
    
    // Refresh balances after staking
    setTimeout(updateGoldBalances, 1000);
    
    return signature;
  }, [walletState.connected, walletState.selectedWallet, updateGoldBalances]);

  // Unstake GOLD tokens
  const unstakeGold = useCallback(async (amount: number) => {
    if (!walletState.connected) {
      throw new Error('Wallet not connected');
    }

    let walletAdapter: any = null;
    switch (walletState.selectedWallet) {
      case 'phantom':
        walletAdapter = (window as any).solana;
        break;
      case 'solflare':
        walletAdapter = (window as any).solflare;
        break;
      case 'backpack':
        walletAdapter = (window as any).backpack;
        break;
      case 'trust':
        walletAdapter = (window as any).trustwallet || (window as any).trust;
        break;
    }

    if (!walletAdapter) {
      throw new Error('Wallet adapter not found');
    }

    const signature = await goldTokenService.unstakeGold(walletAdapter, amount);
    
    // Refresh balances after unstaking
    setTimeout(updateGoldBalances, 1000);
    
    return signature;
  }, [walletState.connected, walletState.selectedWallet, updateGoldBalances]);

  // Swap SOL for GOLD
  const swapSolForGold = useCallback(async (solAmount: number) => {
    if (!walletState.connected) {
      throw new Error('Wallet not connected');
    }

    let walletAdapter: any = null;
    switch (walletState.selectedWallet) {
      case 'phantom':
        walletAdapter = (window as any).solana;
        break;
      case 'solflare':
        walletAdapter = (window as any).solflare;
        break;
      case 'backpack':
        walletAdapter = (window as any).backpack;
        break;
      case 'trust':
        walletAdapter = (window as any).trustwallet || (window as any).trust;
        break;
    }

    if (!walletAdapter) {
      throw new Error('Wallet adapter not found');
    }

    const signature = await goldTokenService.swapSolForGold(walletAdapter, solAmount);
    
    // Refresh balances after swap
    setTimeout(updateGoldBalances, 2000);
    
    return signature;
  }, [walletState.connected, walletState.selectedWallet, updateGoldBalances]);

  // Auto-update balances when wallet state changes
  useEffect(() => {
    updateGoldBalances();
    
    // Set up periodic updates for connected wallet
    if (walletState.connected) {
      const interval = setInterval(updateGoldBalances, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [updateGoldBalances, walletState.connected]);

  return {
    ...goldState,
    transferGold,
    stakeGold,
    unstakeGold,
    swapSolForGold,
    refreshBalances: updateGoldBalances,
    stakingInfo: goldTokenService.getStakingInfo()
  };
}