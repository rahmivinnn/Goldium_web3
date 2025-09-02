import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Send, Lock, ExternalLink, Activity, RefreshCw } from 'lucide-react';
import { fetchRealTransactions, TransactionMonitor, RealTransaction } from '@/lib/solana-transaction-tracker';
import { TREASURY_WALLET, GOLDIUM_TOKEN_ADDRESS } from '@/lib/constants';

export function RealTransactionFeed() {
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [monitor] = useState(() => new TransactionMonitor());

  // Load real transactions from blockchain
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching real blockchain transactions for treasury wallet...');
      const realTxs = await fetchRealTransactions(TREASURY_WALLET, 20);
      setTransactions(realTxs);
      console.log(`Loaded ${realTxs.length} real transactions from blockchain`);
    } catch (error) {
      console.error('Error loading real transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start live monitoring
  const startLiveMonitoring = async () => {
    try {
      await monitor.startMonitoring(TREASURY_WALLET, (newTx) => {
        console.log('New transaction detected:', newTx);
        setTransactions(prev => [newTx, ...prev.slice(0, 19)]); // Keep 20 most recent
      });
      setIsLive(true);
    } catch (error) {
      console.error('Error starting live monitoring:', error);
      setIsLive(false);
    }
  };

  // Stop live monitoring
  const stopLiveMonitoring = () => {
    monitor.stopAll();
    setIsLive(false);
  };

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
    return () => monitor.stopAll();
  }, [monitor]);

  const getTransactionIcon = (type: RealTransaction['type']) => {
    switch (type) {
      case 'SWAP': return <ArrowRightLeft className="w-4 h-4" />;
      case 'SEND':
      case 'TRANSFER': return <Send className="w-4 h-4" />;
      case 'STAKE': return <Lock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTransactionBadgeColor = (type: RealTransaction['type']) => {
    switch (type) {
      case 'SWAP': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SEND':
      case 'TRANSFER': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'STAKE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="bg-galaxy-card border-yellow-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-galaxy-bright flex items-center gap-2">
            <Activity className="w-5 h-5 text-galaxy-blue" />
            Real-Time Transaction Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={isLive ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}
            >
              {isLive ? '🟢 LIVE' : '🔴 OFFLINE'}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={isLive ? stopLiveMonitoring : startLiveMonitoring}
              className="text-galaxy-accent hover:text-galaxy-bright"
            >
              {isLive ? 'Stop' : 'Start'} Live
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadTransactions}
              disabled={isLoading}
              className="text-galaxy-accent hover:text-galaxy-bright"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-galaxy-accent">
          Tracking wallet: {TREASURY_WALLET.slice(0, 8)}...{TREASURY_WALLET.slice(-8)}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading && transactions.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/30 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-yellow-500/30 rounded w-3/4"></div>
                    <div className="h-3 bg-yellow-500/20 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-galaxy-accent">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
            <Button 
              onClick={loadTransactions} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.signature}
                className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/30 flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTransactionBadgeColor(tx.type)}`}
                      >
                        {tx.type}
                      </Badge>
                      <span className="text-sm font-medium text-galaxy-bright">
                        {tx.amount.toFixed(4)} {tx.tokenSymbol}
                      </span>
                      {!tx.success && (
                        <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                          FAILED
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-galaxy-accent">
                      {tx.fromAddress} → {tx.toAddress}
                    </div>
                    <div className="text-xs text-galaxy-accent/70">
                      {formatTimeAgo(tx.timestamp)} • Fee: {tx.fee.toFixed(6)} SOL
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="text-galaxy-blue hover:text-galaxy-bright"
                >
                  <a
                    href={tx.solscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs">Solscan</span>
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}