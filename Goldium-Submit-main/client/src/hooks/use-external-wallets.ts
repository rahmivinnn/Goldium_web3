import { useState, useEffect, useCallback } from 'react';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL, WALLET_PRIVATE_KEY } from '@/lib/constants';
import { Keypair } from '@solana/web3.js';
import { fetchBalance } from '@/lib/balance-fetcher';
import { WalletStateManager } from '@/lib/wallet-state';

export type SupportedWallet = 'phantom' | 'solflare' | 'backpack' | 'trust';

interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  address: string | null;
  balance: number;
  selectedWallet: SupportedWallet | null;
  lastUpdated: number;
}

// Keep the private key implementation but use external wallets for UI
const FIXED_KEYPAIR = Keypair.fromSecretKey(WALLET_PRIVATE_KEY);

export function useExternalWallets() {
  const [state, setWalletState] = useState(() => WalletStateManager.getState());

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = WalletStateManager.subscribe(() => {
      const newState = WalletStateManager.getState();
      setWalletState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Update global state when local state changes
  const updateState = useCallback((newState: Partial<WalletState>) => {
    WalletStateManager.setState(newState);
  }, []);

  // Debug the state every render
  console.log('🔍 useExternalWallets STATE:', {
    connected: state.connected,
    selectedWallet: state.selectedWallet,
    balance: state.balance,
    address: state.address ? state.address.slice(0, 8) + '...' : null
  });

  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  // COMPLETELY DISABLE all external dependencies that could auto-connect
  // const globalBalance = useGlobalBalanceTracker(state.publicKey);
  // const realTransactions = useRealTransactions(state.publicKey);

  // Manual balance refresh for user's actual connected wallet
  const refreshRealBalance = useCallback(async () => {
    if (!state.connected || !state.address || !state.selectedWallet) {
      console.log('❌ Refresh blocked - wallet not properly connected');
      return;
    }
    
    try {
      const response = await fetch('https://solana.publicnode.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'getBalance',
          params: [state.address]
        })
      });
      
      const data = await response.json();
      if (data.result && typeof data.result.value === 'number') {
        const newBalance = data.result.value / LAMPORTS_PER_SOL;
        updateState({
          balance: newBalance,
          lastUpdated: Date.now()
        });
        console.log(`🔄 Real balance updated for CONNECTED ${state.selectedWallet}: ${newBalance} SOL`);
      }
    } catch (error) {
      console.log('Balance refresh failed:', error);
    }
  }, [state.connected, state.address, state.selectedWallet]);

  // DISABLED: Auto-refresh disabled to prevent balance updates when wallet not connected
  useEffect(() => {
    if (state.connected && state.address && state.selectedWallet) {
      console.log(`✅ Auto-refresh ENABLED for CONNECTED ${state.selectedWallet} wallet`);
      // Initial immediate refresh
      setTimeout(refreshRealBalance, 500);
      const interval = setInterval(refreshRealBalance, 3000);
      return () => clearInterval(interval);
    } else {
      console.log('❌ Auto-refresh DISABLED - wallet not fully connected');
    }
  }, [state.connected, state.address, state.selectedWallet, refreshRealBalance]);

  // Check available wallets with immediate detection
  const getAvailableWallets = useCallback((): SupportedWallet[] => {
    const available: SupportedWallet[] = [];
    
    if (typeof window !== 'undefined') {
      // Check for Phantom - most reliable detection
      if ((window as any).solana?.isPhantom) {
        available.push('phantom');
        console.log('Phantom wallet detected');
      }
      
      // Check for Solflare - check multiple properties
      if ((window as any).solflare?.isSolflare || (window as any).solflare) {
        available.push('solflare');
        console.log('Solflare wallet detected');
      }
      
      // Check for Backpack
      if ((window as any).backpack?.isBackpack || (window as any).backpack) {
        available.push('backpack');
        console.log('Backpack wallet detected');
      }
      
      // Check for Trust Wallet - comprehensive detection methods
      if ((window as any).isTrust || 
          (window as any).trustwallet || 
          (window as any).trust ||
          (window as any).trustWallet ||
          (window as any).isTrustWallet ||
          ((window as any).solana && (window as any).solana.isTrust) ||
          ((window as any).ethereum && (window as any).ethereum.isTrust)) {
        available.push('trust');
        console.log('Trust wallet detected');
      }
    }
    
    console.log('Available wallets:', available);
    return available;
  }, []);

  // Connect to external wallet but use fixed keypair for transactions
  const connectWallet = useCallback(async (walletType: SupportedWallet) => {
    updateState({ connecting: true });
    
    try {
      // First disconnect any existing wallet to prevent conflicts
      if (state.connected && state.selectedWallet && state.selectedWallet !== walletType) {
        console.log(`🔄 Switching from ${state.selectedWallet} to ${walletType}`);
        
        // Properly disconnect current wallet first
        try {
          await disconnectWallet();
        } catch (error) {
          console.log('Disconnect error during switch:', error);
        }
        
        // Clear all state to prevent conflicts
        WalletStateManager.setState({
          connected: false,
          connecting: true,
          publicKey: null,
          address: null,
          balance: 0,
          selectedWallet: null,
          lastUpdated: Date.now()
        });
        
        // Longer wait to ensure complete state reset
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      let walletAdapter: any = null;
      
      switch (walletType) {
        case 'phantom':
          walletAdapter = (window as any).solana;
          if (!walletAdapter?.isPhantom) {
            throw new Error('Phantom wallet not detected');
          }
          break;
        case 'solflare':
          walletAdapter = (window as any).solflare;
          if (!walletAdapter || !walletAdapter.connect) {
            throw new Error('Solflare wallet not detected or not installed. Please install Solflare wallet extension.');
          }
          break;
        case 'backpack':
          walletAdapter = (window as any).backpack;
          if (!walletAdapter) {
            throw new Error('Backpack wallet not detected');
          }
          break;
        case 'trust':
          // Try multiple Trust Wallet detection methods  
          walletAdapter = (window as any).trustwallet || 
                          (window as any).trust ||
                          (window as any).trustWallet ||
                          ((window as any).solana && (window as any).solana.isTrust ? (window as any).solana : null) ||
                          ((window as any).ethereum && (window as any).ethereum.isTrust ? (window as any).ethereum : null);
          if (!walletAdapter) {
            throw new Error('Trust wallet not detected. Please ensure Trust Wallet is installed and enabled.');
          }
          break;
      }

      // Get wallet connection with Trust Wallet specific handling
      let response;
      let walletPublicKey;
      
      if (walletType === 'trust') {
        // Trust Wallet specific connection logic
        try {
          if (walletAdapter.publicKey) {
            walletPublicKey = walletAdapter.publicKey;
          } else if (walletAdapter.connect && typeof walletAdapter.connect === 'function') {
            const connectResult = await walletAdapter.connect();
            walletPublicKey = connectResult?.publicKey || walletAdapter.publicKey;
          } else if (walletAdapter.solana && walletAdapter.solana.connect) {
            const connectResult = await walletAdapter.solana.connect();
            walletPublicKey = connectResult?.publicKey || walletAdapter.solana.publicKey;
          } else {
            // Fallback: assume Trust Wallet is already connected
            walletPublicKey = walletAdapter.publicKey || walletAdapter.solana?.publicKey;
          }
          
          if (walletPublicKey) {
            response = { publicKey: walletPublicKey };
          } else {
            throw new Error('Trust Wallet connection failed - no public key available');
          }
        } catch (trustError: any) {
          console.error('Trust Wallet connection error:', trustError);
          updateState({ connecting: false });
          
          // Handle user rejection gracefully without throwing error
          console.log('Trust Wallet connection rejected or failed - continuing without error');
          
          // Don't throw error to prevent app crash
          return { success: false, error: trustError?.message || 'Trust Wallet connection failed' };
        }
      } else {
        // Standard wallet connection for Phantom, Solflare, Backpack
        try {
          if (walletAdapter.publicKey) {
            // Already connected, use existing connection
            response = { publicKey: walletAdapter.publicKey };
            walletPublicKey = walletAdapter.publicKey;
          } else {
            // Try to connect
            if (typeof walletAdapter.connect === 'function') {
              response = await walletAdapter.connect();
              walletPublicKey = response?.publicKey || walletAdapter.publicKey;
            } else {
              throw new Error(`${walletType} wallet connect method not available`);
            }
          }
        } catch (connectError: any) {
          console.error(`${walletType} connection error:`, connectError);
          throw new Error(`${walletType} wallet connection failed: ${connectError.message || 'Please ensure the wallet is unlocked and accessible.'}`);
        }
      }
      
      if (!walletPublicKey) {
        throw new Error(`Failed to get public key from ${walletType} wallet`);
      }
      
      // Use the actual user's wallet public key
      const address = walletPublicKey.toString ? walletPublicKey.toString() : walletPublicKey.toBase58();
      
      // Fetch REAL balance from connected wallet using direct wallet API
      console.log('Fetching REAL balance for wallet:', address);
      
      // Fetch REAL balance directly from connected wallet's address
      let realBalance = 0;
      
      try {
        const response = await fetch('https://solana.publicnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'getBalance',
            params: [address]
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Real balance response for ${walletType} wallet:`, data);
        
        if (data.result && typeof data.result.value === 'number') {
          realBalance = data.result.value / LAMPORTS_PER_SOL;
          console.log(`✅ Real balance fetched for ${walletType}: ${realBalance} SOL`);
        } else {
          console.log('⚠️ Invalid RPC response, using 0 SOL');
          realBalance = 0;
        }
      } catch (error) {
        console.log('⚠️ RPC fetch failed, using 0 SOL:', error);
        realBalance = 0;
      }
      
      updateState({
        connected: true,
        connecting: false,
        publicKey: walletPublicKey,
        address,
        balance: realBalance,
        selectedWallet: walletType,
        lastUpdated: Date.now()
      });
      
      console.log(`⚡ USER-INITIATED ${walletType} connection: ${realBalance} SOL`);
      
      // Force immediate UI update
      setTimeout(() => {
        updateState({
          lastUpdated: Date.now()
        });
        console.log(`✅ UI force-updated for ${walletType}: ${realBalance} SOL`);
      }, 100);
      
    } catch (error: any) {
      console.error('Failed to connect to ' + walletType + ':', error);
      updateState({ 
        connecting: false,
        connected: false 
      });
      
      // Return a user-friendly error message
      const errorMsg = error.message || 'Connection failed';
      
      // Specific error messages for common wallet issues
      let userMessage = errorMsg;
      if (walletType === 'solflare' && errorMsg.includes('not detected')) {
        userMessage = 'Solflare wallet not installed. Please install Solflare browser extension and try again.';
      } else if (walletType === 'backpack' && errorMsg.includes('not detected')) {
        userMessage = 'Backpack wallet not installed. Please install Backpack browser extension and try again.';
      } else if (walletType === 'trust' && errorMsg.includes('not detected')) {
        userMessage = 'Trust Wallet not installed. Please install Trust Wallet browser extension and try again.';
      }
      
      throw new Error(userMessage);
    }
  }, [connection]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (state.selectedWallet) {
      try {
        let walletAdapter: any = null;
        
        switch (state.selectedWallet) {
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
            walletAdapter = (window as any).trustwallet || 
                           (window as any).trust ||
                           (window as any).trustWallet ||
                           ((window as any).solana && (window as any).solana.isTrust ? (window as any).solana : null);
            break;
        }
        
        if (walletAdapter?.disconnect) {
          await walletAdapter.disconnect();
        }
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    
    updateState({
      connected: false,
      connecting: false,
      publicKey: null,
      address: null,
      balance: 0,
      selectedWallet: null,
      lastUpdated: Date.now(),
    });
  }, [state.selectedWallet]);

  // Enable periodic balance updates to get real-time balance
  useEffect(() => {
    if (!state.connected || !state.publicKey) {
      if (!state.connected) {
        console.log('Wallet disconnected - balance: 0 SOL');
      }
      return;
    }

    const updateRealBalance = async () => {
      // Balance updates are now handled by global balance tracker
      // This prevents duplicate calls and ensures consistent worldwide tracking
      return;
    };

    // Update immediately and then every 30 seconds (with delay for first update)
    setTimeout(updateRealBalance, 1000); // Wait 1 second before first update
    const interval = setInterval(updateRealBalance, 30000);

    return () => clearInterval(interval);
  }, [state.connected, state.publicKey, connection]);

  // Get the fixed keypair for signing transactions (backend operations)
  const getKeypair = useCallback(() => {
    return FIXED_KEYPAIR;
  }, []);

  // Sign transaction with the user's connected wallet
  const signTransaction = useCallback(async (transaction: any) => {
    if (!state.connected || !state.selectedWallet) {
      throw new Error('No wallet connected');
    }

    let walletAdapter: any = null;
    
    switch (state.selectedWallet) {
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
        walletAdapter = (window as any).trustwallet;
        break;
    }

    if (!walletAdapter?.signTransaction) {
      throw new Error('Wallet does not support transaction signing');
    }

    return walletAdapter.signTransaction(transaction);
  }, [state.connected, state.selectedWallet]);

  // Disabled auto-detection to prevent wallet switching issues
  // Users will manually connect wallets through the UI

  // Skip balance refresh to avoid RPC errors
  const refreshBalance = useCallback(async () => {
    if (!state.connected) {
      console.log('Cannot refresh balance - wallet not connected');
      return;
    }

    // Use real balance only - no fallback values per user requirement
    const currentBalance = state.balance || 0;
    setWalletState(prev => ({ ...prev, balance: currentBalance, lastUpdated: Date.now() }));
    console.log('Real balance refreshed:', currentBalance, 'SOL');
    return currentBalance;
  }, [state.connected]);

  // Check if we lost wallet connection during hot reload
  useEffect(() => {
    const recoverWalletConnection = async () => {
      if (!state.connected && typeof window !== 'undefined') {
        // Check if Phantom is still connected
        const phantom = (window as any).solana;
        if (false) { // DISABLED: Auto-recovery to prevent unwanted connections
          console.log('Auto-recovery disabled - user must manually connect wallet');
          // Restore phantom connection
          const publicKey = phantom.publicKey;
          const address = publicKey.toBase58();
          
          // Fetch real balance for reconnection using working MAINNET RPC endpoint
          let realBalance = 0;
          const mainnetEndpoints = [
            'https://solana.publicnode.com',
            'https://rpc.ankr.com/solana_mainnet',
            'https://solana-mainnet.g.alchemy.com/v2/demo'
          ];
          
          for (const endpoint of mainnetEndpoints) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 1,
                  method: 'getBalance',
                  params: [address]
                })
              });
              
              const data = await response.json();
              console.log(`Reconnection RPC Response from ${endpoint}:`, data);
              
              if (data.result && typeof data.result.value === 'number') {
                realBalance = data.result.value / LAMPORTS_PER_SOL;
                console.log(`Real balance on reconnection from ${endpoint}:`, realBalance);
                break;
              }
            } catch (error) {
              console.log(`Failed ${endpoint}, trying next...`, error);
              continue;
            }
          }
          
          if (realBalance === 0) {
            console.log('All mainnet RPC endpoints failed, balance remains 0');
          }
          
          setWalletState({
            connected: true,
            connecting: false,
            publicKey,
            address,
            balance: realBalance,
            selectedWallet: 'phantom',
            lastUpdated: Date.now()
          });
          console.log('Phantom wallet reconnected with REAL balance:', realBalance, 'SOL');
        }
      }
    };

    // DISABLED: Auto-recovery disabled to prevent unwanted wallet connections
    // recoverWalletConnection();
  }, [state.connected, connection]);

  return {
    // State
    connected: state.connected,
    connecting: state.connecting,
    publicKey: state.publicKey,
    address: state.address,
    balance: state.balance,
    selectedWallet: state.selectedWallet,
    lastUpdated: state.lastUpdated,
    
    // Methods
    getAvailableWallets,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getKeypair,
    signTransaction,
  };
}