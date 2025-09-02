import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { swapService } from '@/lib/swap-service';
import { stakingService } from '@/lib/staking-service';
import { transactionTracker } from '@/lib/transaction-tracker';
import { transactionHistory } from '@/lib/transaction-history';
import { loadTransactionHistory, type GoldiumTransactionHistory } from '@/lib/historyUtils';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

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

// Inner wallet provider that uses the wallet adapter hooks
function InnerWalletProvider({ children }: WalletProviderProps) {
  const { publicKey, connected, connecting, connect: walletConnect, disconnect: walletDisconnect, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [walletTransactionHistory, setWalletTransactionHistory] = useState<GoldiumTransactionHistory[]>([]);

  // Connect wallet
  const connect = async () => {
    try {
      await walletConnect();
      if (publicKey) {
        await refreshBalance();
        refreshTransactionHistory();
        console.log(`Wallet connected: ${publicKey.toString()}`);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      await walletDisconnect();
      setBalance(0);
      setWalletTransactionHistory([]);
      transactionHistory.setCurrentWallet(null);
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  // Refresh SOL balance
  const refreshBalance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setBalance(solBalance);
      console.log(`Balance: ${solBalance} SOL`);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  // Refresh transaction history from localStorage
  const refreshTransactionHistory = () => {
    if (!publicKey) return;
    
    try {
      const walletAddress = publicKey.toString();
      const history = loadTransactionHistory(walletAddress);
      setWalletTransactionHistory(history);
      
      // Set current wallet in transaction history manager
      transactionHistory.setCurrentWallet(walletAddress);
      
      console.log(`📚 Loaded ${history.length} transactions for wallet`);
    } catch (error) {
      console.error('Error refreshing transaction history:', error);
    }
  };

  // Refresh balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      refreshTransactionHistory();
    }
  }, [connected, publicKey]);

  // Refresh balance periodically
  useEffect(() => {
    if (connected && publicKey) {
      const interval = setInterval(refreshBalance, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  const contextValue: WalletContextType = {
    // Wallet state
    connected,
    connecting,
    publicKey,
    wallet: wallet?.adapter?.name || null,
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

// Main Solana wallet provider
export function SolanaWalletProvider({ children }: WalletProviderProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <InnerWalletProvider>{children}</InnerWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Hook to use wallet context
export function useSolanaWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useSolanaWallet must be used within a SolanaWalletProvider');
  }
  return context;
}

// Export wallet adapter hooks for direct use
export { useWallet, useConnection } from '@solana/wallet-adapter-react';
export { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';