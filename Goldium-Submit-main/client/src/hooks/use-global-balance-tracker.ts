import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

interface GlobalBalanceConfig {
  enableGlobalTracking: boolean;
  updateInterval: number; // in seconds
  fallbackEndpoints: string[];
}

interface BalanceUpdate {
  address: string;
  balance: number;
  timestamp: number;
  endpoint: string;
  country?: string;
}

export function useGlobalBalanceTracker(publicKey: PublicKey | null) {
  const [balance, setBalance] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceUpdate[]>([]);

  // Global RPC endpoints that work worldwide
  const globalEndpoints = [
    'https://solana.publicnode.com',
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana_mainnet',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.helius.xyz/?api-key=',
    'https://mainnet.helius-rpc.com/',
    'https://solana-api.syndica.io/access-token',
    'https://try-rpc.mainnet.solana.blockdaemon.tech'
  ];

  const fetchRealBalance = async (walletAddress: string): Promise<BalanceUpdate | null> => {
    setIsLoading(true);
    setError(null);

    for (const endpoint of globalEndpoints) {
      try {
        console.log(`🌍 Trying global RPC endpoint: ${endpoint}`);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'getBalance',
            params: [walletAddress]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log(`❌ ${endpoint} returned ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`📊 Global balance response from ${endpoint}:`, data);

        if (data.result && typeof data.result.value === 'number') {
          const balanceSOL = data.result.value / 1_000_000_000; // Convert lamports to SOL
          
          const balanceUpdate: BalanceUpdate = {
            address: walletAddress,
            balance: balanceSOL,
            timestamp: Date.now(),
            endpoint,
            country: detectUserCountry()
          };

          console.log(`✅ Global balance fetched: ${balanceSOL} SOL from ${endpoint}`);
          setIsLoading(false);
          return balanceUpdate;
        }
      } catch (error) {
        console.log(`🚫 Global RPC ${endpoint} failed:`, error);
        continue;
      }
    }

    setError('All global RPC endpoints failed');
    setIsLoading(false);
    return null;
  };

  const detectUserCountry = (): string => {
    // Use browser timezone to detect approximate location without external API
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Extract country/region from timezone
      if (timezone.includes('America')) return 'Americas';
      if (timezone.includes('Europe')) return 'Europe';
      if (timezone.includes('Asia')) return 'Asia';
      if (timezone.includes('Australia')) return 'Australia';
      if (timezone.includes('Africa')) return 'Africa';
      return 'Global';
    } catch {
      return 'Global';
    }
  };

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      setLastUpdate(0);
      return;
    }

    const walletAddress = publicKey.toBase58();
    
    const updateBalance = async () => {
      const balanceUpdate = await fetchRealBalance(walletAddress);
      
      if (balanceUpdate) {
        setBalance(balanceUpdate.balance);
        setLastUpdate(balanceUpdate.timestamp);
        
        // Add to history (keep last 10 updates)
        setBalanceHistory(prev => [
          balanceUpdate,
          ...prev.slice(0, 9)
        ]);
      }
    };

    // Update immediately
    updateBalance();

    // Set up real-time updates every 10 seconds for global tracking
    const interval = setInterval(updateBalance, 10000);

    return () => clearInterval(interval);
  }, [publicKey]);

  return {
    balance,
    lastUpdate,
    isLoading,
    error,
    balanceHistory,
    refetch: () => {
      if (publicKey) {
        fetchRealBalance(publicKey.toBase58());
      }
    }
  };
}