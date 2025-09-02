import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';
import { selfContainedWallet, walletInfo } from '@/lib/wallet-service';
import { swapService } from '@/lib/swap-service';
import { stakingService } from '@/lib/staking-service';
import { transactionTracker } from '@/lib/transaction-tracker';
import { transactionHistory } from '@/lib/transaction-history';
import { loadTransactionHistory, type GoldiumTransactionHistory } from '@/lib/historyUtils';

// Wallet context interface
interface WalletContextType {
  // Wallet connection
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  wallet: string | null;
  balance: number;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Balance methods
  refreshBalance: () => Promise<void>;
  
  // Services
  swapService: typeof swapService;
  stakingService: typeof stakingService;
  transactionTracker: typeof transactionTracker;

  // Transaction history
  transactionHistory: GoldiumTransactionHistory[];
  refreshTransactionHistory: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function SelfContainedWalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [walletTransactionHistory, setWalletTransactionHistory] = useState<GoldiumTransactionHistory[]>([]);

  // Initialize wallet connection
  const connect = async () => {
    setConnecting(true);
    try {
      // Self-contained wallet is always "connected"
      setConnected(true);
      await refreshBalance();

      // Load transaction history when wallet connects
      refreshTransactionHistory();

      console.log(`Self-contained wallet connected: ${walletInfo.address}`);
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    setConnected(false);
    setBalance(0);
    setWalletTransactionHistory([]);

    // Clear current wallet in transaction history manager
    transactionHistory.setCurrentWallet(null);

    console.log('Self-contained wallet disconnected');
  };

  // Refresh SOL balance
  const refreshBalance = async () => {
    try {
      const newBalance = await selfContainedWallet.getBalance();
      setBalance(newBalance);
      // Reduce console noise - balance is self-contained at 0 SOL
      if (newBalance > 0) {
        console.log(`Self-contained balance: ${newBalance} SOL`);
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  // Refresh transaction history from localStorage
  const refreshTransactionHistory = () => {
    try {
      const walletAddress = walletInfo.address;
      const history = loadTransactionHistory(walletAddress);
      setWalletTransactionHistory(history);

      // Also set current wallet in the old transaction history manager for compatibility
      transactionHistory.setCurrentWallet(walletAddress);

      console.log(`📚 Loaded ${history.length} transactions for self-contained wallet`);
    } catch (error) {
      console.error('Error refreshing transaction history:', error);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, []);

  // Refresh balance periodically
  useEffect(() => {
    if (connected) {
      const interval = setInterval(refreshBalance, 20000); // Every 20 seconds to reduce load
      return () => clearInterval(interval);
    }
  }, [connected]);

  const contextValue: WalletContextType = {
    // Wallet state
    connected,
    connecting,
    publicKey: connected ? walletInfo.publicKey : null,
    wallet: connected ? walletInfo.walletType : null,
    balance,
    
    // Methods
    connect,
    disconnect,
    refreshBalance,
    
    // Services
    swapService,
    stakingService,
    transactionTracker,

    // Transaction history
    transactionHistory: walletTransactionHistory,
    refreshTransactionHistory
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useSelfContainedWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useSelfContainedWallet must be used within a SelfContainedWalletProvider');
  }
  return context;
}

// Export wallet address for easy access
export const WALLET_ADDRESS = walletInfo.address;