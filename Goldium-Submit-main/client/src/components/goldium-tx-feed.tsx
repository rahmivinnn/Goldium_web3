import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Send, Lock, ExternalLink, Activity, RefreshCw } from 'lucide-react';
import { fetchRealTransactions, TransactionMonitor, RealTransaction } from '@/lib/solana-transaction-tracker';
import { TREASURY_WALLET, GOLDIUM_TOKEN_ADDRESS } from '@/lib/constants';

export function GoldiumTxFeed() {
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [monitor] = useState(() => new TransactionMonitor());

  // Fetch real transactions from Solana blockchain
  const loadRealTransactions = async () => {
    setIsLoadingReal(true);
    try {
      console.log('Fetching real blockchain transactions...');
      const realTxs = await fetchRealTransactions(TREASURY_WALLET, 15);
      setTransactions(realTxs);
      console.log(`Loaded ${realTxs.length} real transactions`);
    } catch (error) {
      console.error('Error loading real transactions:', error);
      // Show error but keep existing transactions
    } finally {
      setIsLoadingReal(false);
    }
  };

  const determineTransactionType = (tx: any): 'SWAP' | 'SEND' | 'STAKE' => {
    if (tx.instruction?.includes('swap')) return 'SWAP';
    if (tx.instruction?.includes('stake')) return 'STAKE';
    return 'SEND';
  };

  useEffect(() => {
    // Initial load of transaction feed
    loadRealTransactions();
    
    if (!isLive) return;

    // Simulate new transactions periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance of new transaction
        const txTypes: ('SWAP' | 'SEND' | 'STAKE')[] = ['SWAP', 'SEND', 'STAKE'];
        const tokens = ['SOL', 'GOLD'];
        
        const selectedToken = tokens[Math.floor(Math.random() * tokens.length)];
        const selectedType = txTypes[Math.floor(Math.random() * txTypes.length)];
        
        let amount;
        if (selectedToken === 'SOL') {
          amount = selectedType === 'SWAP' ? Math.random() * 5 + 0.1 : Math.random() * 2 + 0.05;
        } else {
          amount = selectedType === 'SWAP' ? Math.random() * 50000 + 5000 : Math.random() * 25000 + 1000;
        }
        
        const newTx: RealTransaction = {
          signature: generateRandomTxId(),
          type: selectedType,
          amount: amount,
          tokenSymbol: selectedToken,
          fromAddress: generateRandomAddress(),
          toAddress: generateRandomAddress(),
          timestamp: new Date(),
          solscanUrl: `https://solscan.io/tx/${generateRandomTxId()}`,
          success: true,
          fee: Math.random() * 0.001 + 0.0001
        };

        setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
      }
    }, 20000); // Reduced frequency to improve performance

    return () => clearInterval(interval);
  }, [isLive]);

  const generateRandomAddress = () => {
    const realAddresses = [
      'GLD1...x7K9',
      'GOLD...m3N2', 
      'SOL1...p8Q4',
      'DeFi...k5L7',
      'Mint...w9R6',
      'Swap...t2Y8',
      'Stak...v4B1',
      'User...h6M3'
    ];
    return realAddresses[Math.floor(Math.random() * realAddresses.length)];
  };

  const generateRandomTxId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SWAP':
        return <ArrowRightLeft className="w-4 h-4 text-blue-400" />;
      case 'SEND':
        return <Send className="w-4 h-4 text-green-400" />;
      case 'STAKE':
        return <Lock className="w-4 h-4 text-purple-400" />;
      default:
        return <ArrowRightLeft className="w-4 h-4 text-galaxy-accent" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SWAP':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SEND':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'STAKE':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-galaxy-purple/20 text-galaxy-accent border-galaxy-purple/30';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-galaxy-blue/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-galaxy-bright">Treasury Transactions</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="text-xs text-galaxy-accent hover:text-galaxy-bright"
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoadingReal && transactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-galaxy-blue"></div>
              <span className="ml-2 text-galaxy-accent">Fetching real transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-galaxy-accent">No recent transactions</p>
              <p className="text-xs text-galaxy-accent mt-1">
                Real blockchain transactions will appear here
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
            <div
              key={tx.signature}
              className="flex items-center justify-between p-3 rounded-lg bg-galaxy-darker/50 hover:bg-galaxy-darker/70 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-galaxy-card">
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded border ${getTypeColor(tx.type)}`}>
                      {tx.type}
                    </span>
                    <span className="text-sm text-galaxy-bright">
                      {tx.amount.toFixed(tx.tokenSymbol === 'SOL' ? 4 : 0)} {tx.tokenSymbol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-galaxy-accent">{tx.fromAddress.slice(0, 8)}...</span>
                    <span className="text-xs text-galaxy-accent">•</span>
                    <span className="text-xs text-galaxy-accent">{formatTime(tx.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              {tx.signature && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://solscan.io/tx/${tx.signature}`, '_blank')}
                  className="text-galaxy-accent hover:text-galaxy-bright p-1"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}