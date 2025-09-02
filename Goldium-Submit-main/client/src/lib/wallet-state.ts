// Global wallet state manager to fix multiple instance issues
import { PublicKey } from '@solana/web3.js';
import type { SupportedWallet } from '@/hooks/use-external-wallets';

interface GlobalWalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  address: string | null;
  balance: number;
  selectedWallet: SupportedWallet | null;
  lastUpdated: number;
}

let globalState: GlobalWalletState = {
  connected: false,
  connecting: false,
  publicKey: null,
  address: null,
  balance: 0,
  selectedWallet: null,
  lastUpdated: 0,
};

const listeners = new Set<() => void>();

export const WalletStateManager = {
  getState: () => ({ ...globalState }),
  
  setState: (newState: Partial<GlobalWalletState>) => {
    globalState = { ...globalState, ...newState, lastUpdated: Date.now() };
    console.log('🔄 Global wallet state updated:', globalState);
    listeners.forEach(listener => listener());
  },
  
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  reset: () => {
    globalState = {
      connected: false,
      connecting: false,
      publicKey: null,
      address: null,
      balance: 0,
      selectedWallet: null,
      lastUpdated: 0,
    };
    listeners.forEach(listener => listener());
  }
};