import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: PublicKey | null;
  wallet: string | null;
  connect(walletName: string): Promise<void>;
  disconnect(): Promise<void>;
  balance: number;
}

const WalletContext = createContext<WalletContextState>({
  connected: false,
  connecting: false,
  disconnecting: false,
  publicKey: null,
  wallet: null,
  connect: async () => {},
  disconnect: async () => {},
  balance: 0,
});

export const useWallet = () => useContext(WalletContext);

export function MultiWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);

  // Fetch balance when publicKey changes
  const fetchBalance = useCallback(async (pubKey: PublicKey) => {
    if (!pubKey) return;

    try {
      console.log('Fetching balance for:', pubKey.toString());
      
      // Use our backend proxy
      const response = await fetch('/api/solana-rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [pubKey.toString(), { commitment: 'confirmed' }]
        })
      });

      const data = await response.json();
      if (data.result?.value !== undefined) {
        const lamports = data.result.value;
        const solBalance = lamports / 1_000_000_000; // Convert lamports to SOL
        // Reduce console noise for multi-wallet updates
        if (solBalance > 0) {
          console.log('Multi-wallet balance:', solBalance, 'SOL for', wallet);
        }
        setBalance(solBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [wallet]);

  // Auto-refresh balance every 15 seconds to reduce load
  useEffect(() => {
    if (!publicKey || !connected) return;

    fetchBalance(publicKey);
    const interval = setInterval(() => {
      fetchBalance(publicKey);
    }, 15000);

    return () => clearInterval(interval);
  }, [publicKey, connected, fetchBalance]);

  // Detect wallet changes and auto-reconnect
  useEffect(() => {
    const detectWalletChanges = () => {
      if (!connected || !wallet) return;

      let currentAdapter: any = null;
      
      switch (wallet) {
        case 'Phantom':
          currentAdapter = (window as any).solana;
          break;
        case 'Solflare':
          currentAdapter = (window as any).solflare;
          break;
        case 'Backpack':
          currentAdapter = (window as any).backpack;
          break;
        case 'Trust Wallet':
          currentAdapter = (window as any).trustwallet || (window as any).solana;
          break;
      }

      if (currentAdapter?.publicKey) {
        const newPublicKey = currentAdapter.publicKey.toString();
        if (publicKey?.toString() !== newPublicKey) {
          console.log('Wallet address changed, updating...', newPublicKey);
          setPublicKey(new RealPublicKey(newPublicKey));
        }
      }
    };

    if (connected) {
      const interval = setInterval(detectWalletChanges, 10000);
      return () => clearInterval(interval);
    }
  }, [connected, wallet, publicKey]);

  const connect = async (walletName: string): Promise<void> => {
    if (connecting) return;
    
    setConnecting(true);
    
    try {
      let adapter: any = null;
      
      switch (walletName) {
        case 'Phantom':
          adapter = (window as any).solana;
          if (!adapter?.isPhantom) {
            throw new Error('Phantom wallet not found');
          }
          break;
        case 'Solflare':
          adapter = (window as any).solflare;
          if (!adapter) {
            throw new Error('Solflare wallet not found. Please make sure Solflare extension is installed and enabled.');
          }
          break;
        case 'Backpack':
          adapter = (window as any).backpack;
          if (!adapter?.isBackpack) {
            throw new Error('Backpack wallet not found');
          }
          break;
        case 'Trust Wallet':
          // Trust Wallet injects into window.solana but with isTrust property
          adapter = (window as any).solana;
          if (!adapter || (!adapter.isTrust && !adapter.isTrustWallet)) {
            // Try alternative Trust Wallet injection
            adapter = (window as any).trustwallet || (window as any).trust;
            if (!adapter) {
              throw new Error('Trust Wallet not found. Please make sure Trust Wallet extension is installed and enabled.');
            }
          }
          break;
        default:
          throw new Error('Unknown wallet');
      }

      console.log(`Connecting to ${walletName}...`);
      
      // Connect to the wallet
      const result = await adapter.connect();
      const pubKey = result.publicKey || adapter.publicKey;
      
      if (!pubKey) {
        throw new Error('Failed to get public key from wallet');
      }

      const publicKeyObj = new RealPublicKey(pubKey.toString());
      
      console.log('Connected to', walletName, 'with address:', pubKey.toString());
      
      setPublicKey(publicKeyObj);
      setWallet(walletName);
      setConnected(true);
      
      // Immediately fetch balance for the new wallet
      await fetchBalance(publicKeyObj);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setConnected(false);
      setPublicKey(null);
      setWallet(null);
      setBalance(0);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    if (disconnecting) return;
    
    setDisconnecting(true);
    
    try {
      let adapter: any = null;
      
      switch (wallet) {
        case 'Phantom':
          adapter = (window as any).solana;
          break;
        case 'Solflare':
          adapter = (window as any).solflare;
          break;
        case 'Backpack':
          adapter = (window as any).backpack;
          break;
        case 'Trust Wallet':
          adapter = (window as any).solana;
          if (!adapter || (!adapter.isTrust && !adapter.isTrustWallet)) {
            adapter = (window as any).trustwallet || (window as any).trust;
          }
          break;
      }

      if (adapter?.disconnect) {
        await adapter.disconnect();
      }
      
      console.log('Disconnected from', wallet);
      
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setConnected(false);
      setPublicKey(null);
      setWallet(null);
      setBalance(0);
      setDisconnecting(false);
    }
  };

  const value: WalletContextState = {
    connected,
    connecting,
    disconnecting,
    publicKey,
    wallet,
    connect,
    disconnect,
    balance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}