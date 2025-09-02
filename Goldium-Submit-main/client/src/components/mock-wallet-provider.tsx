import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock wallet adapter interfaces
interface PublicKey {
  toString(): string;
  toBase58(): string;
}

interface WalletContextState {
  autoConnect: boolean;
  wallets: any[];
  wallet: any | null;
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

interface ConnectionContextState {
  connection: any;
}

// Mock PublicKey class
class MockPublicKey {
  private key: string;
  
  constructor(key?: string) {
    this.key = key || 'GLD1x7K9m3N2p8Q4k5L7w9R6t2Y8v4B1h6M3';
  }
  
  toString(): string {
    return this.key;
  }
  
  toBase58(): string {
    return this.key;
  }
}

// Mock contexts
const WalletContext = createContext<WalletContextState>({} as WalletContextState);
const ConnectionContext = createContext<ConnectionContextState>({} as ConnectionContextState);

// Mock hooks
export function useWallet(): WalletContextState {
  const context = useContext(WalletContext);
  if (!context) {
    return {
      autoConnect: false,
      wallets: [],
      wallet: null,
      publicKey: null,
      connecting: false,
      connected: false,
      disconnecting: false,
      select: () => {},
      connect: async () => {},
      disconnect: async () => {},
    };
  }
  return context;
}

export function useConnection(): ConnectionContextState {
  return useContext(ConnectionContext);
}

// Mock wallet modal hook
export function useWalletModal() {
  const [visible, setVisible] = useState(false);
  return {
    visible,
    setVisible,
  };
}

// Mock multi-button component
export function WalletMultiButton({ 
  className, 
  children, 
  ...props 
}: { 
  className?: string; 
  children?: ReactNode;
  [key: string]: any;
}) {
  const { connected, connect, disconnect, publicKey } = useWallet();
  
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
      {...props}
    >
      {connected 
        ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`
        : 'Connect Wallet'
      }
    </button>
  );
}

// Mock providers
interface MockWalletProviderProps {
  children: ReactNode;
}

export function WalletProviderWrapper({ children }: MockWalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const connect = async () => {
    setConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setConnected(true);
    setPublicKey(new MockPublicKey('GLD1x7K9m3N2p8Q4k5L7w9R6t2Y8v4B1h6M3'));
    setConnecting(false);
  };

  const disconnect = async () => {
    setConnected(false);
    setPublicKey(null);
  };

  const signTransaction = async (transaction: any) => {
    // Mock transaction signing
    return transaction;
  };

  const walletContextValue: WalletContextState = {
    autoConnect: false,
    wallets: [],
    wallet: connected ? { name: 'Mock Wallet' } : null,
    publicKey,
    connecting,
    connected,
    disconnecting: false,
    select: () => {},
    connect,
    disconnect,
    signTransaction,
  };

  const connectionContextValue: ConnectionContextState = {
    connection: {
      getBalance: async () => 2500000000, // 2.5 SOL in lamports
      getLatestBlockhash: async () => ({ blockhash: 'goldium-mock-blockhash' }),
      sendRawTransaction: async () => 'GLD1x7K9m3N2p8Q4k5L7w9R6t2Y8v4B1h6M3signature',
      confirmTransaction: async () => ({ value: { err: null } }),
      getTokenAccountsByOwner: async () => ({
        value: [{
          account: {
            data: {
              parsed: {
                info: {
                  tokenAmount: {
                    amount: '125000000', // 125,000 GOLD tokens
                    decimals: 3,
                    uiAmount: 125000
                  }
                }
              }
            }
          }
        }]
      }),
    },
  };

  return (
    <ConnectionContext.Provider value={connectionContextValue}>
      <WalletContext.Provider value={walletContextValue}>
        {children}
      </WalletContext.Provider>
    </ConnectionContext.Provider>
  );
}

// Export wallet adapter network enum mock
export const WalletAdapterNetwork = {
  Mainnet: 'mainnet-beta',
  Testnet: 'testnet',
  Devnet: 'devnet',
};

// Mock wallet adapters
export class PhantomWalletAdapter {
  name = 'Phantom';
}

export class SolflareWalletAdapter {
  name = 'Solflare';
}

export class BackpackWalletAdapter {
  name = 'Backpack';
}

// Mock CSS import (no-op)
export const mockWalletAdapterCSS = '';