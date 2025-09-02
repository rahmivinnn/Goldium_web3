import { useState, useEffect } from 'react';
import { useExternalWallets } from './use-external-wallets';

// Custom hook for instant balance updates when switching wallets
export function useInstantBalance() {
  const wallet = useExternalWallets();
  const [instantBalance, setInstantBalance] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // DISABLED: Only fetch balance when wallet is TRULY connected by user
  useEffect(() => {
    if (!wallet.connected || !wallet.address || !wallet.selectedWallet) {
      setInstantBalance(0);
      return;
    }

    // Additional check: only proceed if wallet has a valid connection with proper state
    if (wallet.connected && wallet.address && wallet.selectedWallet) {
      const fetchInstantBalance = async () => {
        setIsUpdating(true);
        
        try {
          console.log(`⚡ Fetching INSTANT balance for ${wallet.selectedWallet}`);
          
          const response = await fetch('https://solana.publicnode.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method: 'getBalance',
              params: [wallet.address, { commitment: 'confirmed' }]
            })
          });
          
          const data = await response.json();
          
          if (data.result?.value !== undefined) {
            const balance = data.result.value / 1000000000; // LAMPORTS_PER_SOL
            setInstantBalance(balance);
            console.log(`⚡ INSTANT balance updated: ${balance} SOL for ${wallet.selectedWallet}`);
          }
        } catch (error) {
          console.error('Instant balance fetch failed:', error);
          setInstantBalance(wallet.balance || 0);
        } finally {
          setIsUpdating(false);
        }
      };

      // Fetch immediately when wallet changes
      fetchInstantBalance();
      
      // Set up interval for quick refreshes
      const interval = setInterval(fetchInstantBalance, 2000);
      
      return () => clearInterval(interval);
    }
  }, [wallet.address, wallet.selectedWallet, wallet.connected]);

  return {
    balance: instantBalance || wallet.balance || 0,
    isUpdating,
    walletType: wallet.selectedWallet,
    address: wallet.address
  };
}