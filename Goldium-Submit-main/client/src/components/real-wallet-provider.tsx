import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Real wallet adapter interfaces based on Solana standards
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      publicKey?: { toString(): string };
      isConnected?: boolean;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
    };
    solflare?: {
      isSolflare?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      publicKey?: { toString(): string };
      isConnected?: boolean;
    };
    backpack?: {
      isBackpack?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      publicKey?: { toString(): string };
      isConnected?: boolean;
    };
  }
}

interface PublicKey {
  toString(): string;
  toBase58(): string;
}

class RealPublicKey implements PublicKey {
  constructor(private key: string) {}
  
  toString(): string {
    return this.key;
  }
  
  toBase58(): string {
    return this.key;
  }
}

interface WalletContextState {
  autoConnect: boolean;
  wallets: Wallet[];
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;
  select(walletName: string): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendTransaction?: any;
  signTransaction?: any;
  signAllTransactions?: any;
  signMessage?: any;
}

interface Wallet {
  name: string;
  icon: string;
  adapter: any;
}

interface ConnectionContextState {
  connection: any;
}

// Available wallets with better detection
const WALLET_ADAPTERS = [
  {
    name: 'Phantom',
    icon: '🟣',
    adapter: () => window.solana?.isPhantom ? window.solana : null,
  },
  {
    name: 'Solflare',
    icon: '🔥',
    adapter: () => window.solflare || window.solflare,
  },
  {
    name: 'Backpack',
    icon: '🎒',
    adapter: () => window.backpack?.isBackpack ? window.backpack : null,
  },
  {
    name: 'Trust Wallet',
    icon: '🔒',
    adapter: () => window.solana && !window.solana.isPhantom ? window.solana : null,
  },
];

// Real connection to Solana mainnet
class RealConnection {
  constructor(private endpoint: string) {}

  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [publicKey.toString(), { commitment: 'confirmed' }]
        })
      });
      const data = await response.json();
      return data.result?.value || 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async getLatestBlockhash(): Promise<{ blockhash: string }> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getLatestBlockhash',
          params: [{ commitment: 'confirmed' }]
        })
      });
      const data = await response.json();
      return { blockhash: data.result?.value?.blockhash || 'latest-blockhash' };
    } catch (error) {
      console.error('Error getting latest blockhash:', error);
      return { blockhash: 'latest-blockhash' };
    }
  }

  async sendRawTransaction(serializedTransaction: Uint8Array): Promise<string> {
    try {
      const base64Transaction = btoa(String.fromCharCode(...serializedTransaction));
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendTransaction',
          params: [base64Transaction, { encoding: 'base64', skipPreflight: false }]
        })
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.result;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async confirmTransaction(signature: string): Promise<any> {
    // Poll for transaction confirmation
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSignatureStatuses',
            params: [[signature]]
          })
        });
        const data = await response.json();
        const status = data.result?.value?.[0];
        if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
          return { value: { err: status.err } };
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return { value: { err: null } };
  }
}

// Contexts
const WalletContext = createContext<WalletContextState>({} as WalletContextState);
const ConnectionContext = createContext<ConnectionContextState>({} as ConnectionContextState);

// Hooks
export function useWallet(): WalletContextState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export function useConnection(): ConnectionContextState {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

// Wallet button component
export function WalletMultiButton({ 
  className, 
  children, 
  ...props 
}: { 
  className?: string; 
  children?: ReactNode;
  [key: string]: any;
}) {
  const { connected, connect, disconnect, publicKey, connecting } = useWallet();
  
  const handleClick = async () => {
    if (connected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <button
      className={`wallet-adapter-button ${className || ''}`}
      onClick={handleClick}
      disabled={connecting}
      {...props}
    >
      {connecting 
        ? 'Connecting...'
        : connected 
          ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`
          : 'Connect Wallet'
      }
    </button>
  );
}

// Real wallet provider
interface RealWalletProviderProps {
  children: ReactNode;
}

export function WalletProviderWrapper({ children }: RealWalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<any>(null);

  // Check for wallet availability with better detection
  const availableWallets = WALLET_ADAPTERS.filter(wallet => {
    const adapter = wallet.adapter();
    if (!adapter) return false;
    
    switch (wallet.name) {
      case 'Phantom':
        return adapter.isPhantom === true;
      case 'Solflare':
        return adapter.isSolflare === true || adapter.constructor?.name === 'SolflareAdapter';
      case 'Backpack':
        return adapter.isBackpack === true;
      case 'Trust Wallet':
        return adapter && !adapter.isPhantom && !adapter.isBackpack;
      default:
        return true;
    }
  });

  // Auto-connect logic
  // DISABLED: Auto-connect disabled to prevent unwanted wallet connections
  useEffect(() => {
    // No automatic connection - user must click connect button
    console.log('Auto-connect disabled in real-wallet-provider');
  }, []);

  const select = useCallback((walletName: string) => {
    const wallet = availableWallets.find(w => w.name === walletName);
    if (wallet) {
      setSelectedWallet(wallet);
      setWalletAdapter(wallet.adapter());
    }
  }, [availableWallets]);

  const connect = useCallback(async () => {
    if (connecting || connected) return;

    setConnecting(true);
    try {
      let adapter = walletAdapter;
      
      // Auto-select first available wallet if none selected
      if (!adapter && availableWallets.length > 0) {
        const wallet = availableWallets[0];
        setSelectedWallet(wallet);
        adapter = wallet.adapter();
        setWalletAdapter(adapter);
      }

      if (!adapter) {
        throw new Error('No wallet found. Please install a Solana wallet.');
      }

      const result = await adapter.connect();
      
      setConnected(true);
      const pubkeyString = result.publicKey?.toString() || adapter.publicKey?.toString();
      console.log('Connected wallet public key:', pubkeyString);
      setPublicKey(new RealPublicKey(pubkeyString));

      // Listen for disconnect events
      if (adapter.on) {
        adapter.on('disconnect', () => {
          setConnected(false);
          setPublicKey(null);
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [connecting, connected, walletAdapter, availableWallets]);

  const disconnect = useCallback(async () => {
    if (!connected || disconnecting) return;

    setDisconnecting(true);
    try {
      if (walletAdapter?.disconnect) {
        await walletAdapter.disconnect();
      }
      setConnected(false);
      setPublicKey(null);
      setSelectedWallet(null);
      setWalletAdapter(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setDisconnecting(false);
    }
  }, [connected, disconnecting, walletAdapter]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!connected || !walletAdapter) {
      throw new Error('Wallet not connected');
    }
    return await walletAdapter.signTransaction(transaction);
  }, [connected, walletAdapter]);

  const walletContextValue: WalletContextState = {
    autoConnect: true,
    wallets: availableWallets,
    wallet: selectedWallet,
    publicKey,
    connecting,
    connected,
    disconnecting,
    select,
    connect,
    disconnect,
    signTransaction,
  };

  const connectionContextValue: ConnectionContextState = {
    connection: new RealConnection('https://rpc.ankr.com/solana'),
  };

  return (
    <ConnectionContext.Provider value={connectionContextValue}>
      <WalletContext.Provider value={walletContextValue}>
        {children}
      </WalletContext.Provider>
    </ConnectionContext.Provider>
  );
}

// Exports for compatibility
export const WalletAdapterNetwork = {
  Mainnet: 'mainnet-beta',
  Testnet: 'testnet',
  Devnet: 'devnet',
};

export class PhantomWalletAdapter {
  name = 'Phantom';
}

export class SolflareWalletAdapter {
  name = 'Solflare';
}

export class BackpackWalletAdapter {
  name = 'Backpack';
}