import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { externalWalletService, ExternalWalletType } from '@/lib/external-wallet-service';
import { useSolanaWallet } from '@/components/solana-wallet-provider';

export type WalletMode = 'self-contained' | 'external';

interface MultiWalletState {
  mode: WalletMode;
  externalWalletType: ExternalWalletType | null;
  publicKey: PublicKey | null;
  address: string | null;
  balance: number;
  connected: boolean;
  connecting: boolean;
}

export function useMultiWallet() {
  const selfContainedWallet = useSolanaWallet();
  
  const [state, setState] = useState<MultiWalletState>({
    mode: 'self-contained',
    externalWalletType: null,
    publicKey: selfContainedWallet.publicKey,
    address: selfContainedWallet.publicKey?.toBase58() || null,
    balance: selfContainedWallet.balance,
    connected: selfContainedWallet.connected,
    connecting: false,
  });

  // Update balance periodically
  useEffect(() => {
    const updateBalance = async () => {
      if (state.mode === 'self-contained') {
        setState(prev => ({
          ...prev,
          balance: selfContainedWallet.balance,
          connected: selfContainedWallet.connected,
          publicKey: selfContainedWallet.publicKey,
          address: selfContainedWallet.publicKey?.toBase58() || null,
        }));
      } else if (state.mode === 'external' && externalWalletService.isConnected()) {
        const balance = await externalWalletService.getBalance();
        setState(prev => ({ ...prev, balance }));
      }
    };

    updateBalance();
    const interval = setInterval(updateBalance, 10000);
    return () => clearInterval(interval);
  }, [state.mode, selfContainedWallet.balance, selfContainedWallet.connected]);

  // Switch to self-contained wallet
  const switchToSelfContained = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true }));
    
    try {
      // Disconnect external wallet if connected
      if (state.mode === 'external') {
        await externalWalletService.disconnectWallet();
      }
      
      setState({
        mode: 'self-contained',
        externalWalletType: null,
        publicKey: selfContainedWallet.publicKey,
        address: selfContainedWallet.publicKey?.toBase58() || null,
        balance: selfContainedWallet.balance,
        connected: selfContainedWallet.connected,
        connecting: false,
      });
    } catch (error) {
      console.error('Error switching to self-contained wallet:', error);
      setState(prev => ({ ...prev, connecting: false }));
    }
  }, [state.mode, selfContainedWallet]);

  // Switch to external wallet
  const switchToExternalWallet = useCallback(async (walletType: ExternalWalletType) => {
    setState(prev => ({ ...prev, connecting: true }));
    
    try {
      const { publicKey, address } = await externalWalletService.connectWallet(walletType);
      const balance = await externalWalletService.getBalance();
      
      setState({
        mode: 'external',
        externalWalletType: walletType,
        publicKey,
        address,
        balance,
        connected: true,
        connecting: false,
      });
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error);
      setState(prev => ({ ...prev, connecting: false }));
      throw error;
    }
  }, []);

  // Get available external wallets
  const getAvailableExternalWallets = useCallback(() => {
    return externalWalletService.getAvailableWallets();
  }, []);

  // Sign transaction (works with both wallet types)
  const signTransaction = useCallback(async (transaction: any) => {
    if (state.mode === 'self-contained') {
      // Use self-contained wallet signing - placeholder for now
      console.log('Signing with self-contained wallet');
      return transaction;
    } else if (state.mode === 'external') {
      return externalWalletService.signTransaction(transaction);
    }
    throw new Error('No wallet connected');
  }, [state.mode]);

  return {
    // State
    mode: state.mode,
    externalWalletType: state.externalWalletType,
    publicKey: state.publicKey,
    address: state.address,
    balance: state.balance,
    connected: state.connected,
    connecting: state.connecting,
    
    // Methods
    switchToSelfContained,
    switchToExternalWallet,
    getAvailableExternalWallets,
    signTransaction,
  };
}