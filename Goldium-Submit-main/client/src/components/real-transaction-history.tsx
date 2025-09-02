import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealTransactions } from '@/hooks/use-real-transactions';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { ExternalLink, RefreshCw, ArrowUpRight, ArrowDownLeft, Repeat, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function RealTransactionHistory() {
  const wallet = useExternalWallets();
  const { transactions, isLoading, error, refetch } = useRealTransactions(wallet.publicKey);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'swap':
        return <Repeat className="w-4 h-4" />;
      case 'stake':
        return <Shield className="w-4 h-4" />;
      default:
        return <ArrowDownLeft className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const formatSOL = (lamports: number) => {
    return (lamports / 1_000_000_000).toFixed(6);
  };

  if (!wallet.connected) {
    return (
      <Card className="bg-galaxy-card border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-galaxy-text flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Real Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-galaxy-muted">Connect your wallet to view real transaction history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-galaxy-card border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-galaxy-text flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Real Transaction History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-galaxy-accent">
              {transactions.length} transactions
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              className="border-yellow-500/50 hover:bg-yellow-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">Failed to load transactions: {error}</p>
          </div>
        )}

        {isLoading && transactions.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-yellow-500/10 rounded-lg h-16" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-galaxy-muted">No transactions found for this wallet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.signature}
                  className="border border-yellow-500/20 rounded-lg p-4 hover:border-yellow-500/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-galaxy-text capitalize">
                            {tx.type}
                          </p>
                          <Badge className={getStatusColor(tx.status)}>
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-galaxy-muted">
                          <span>Slot: {tx.slot.toLocaleString()}</span>
                          <span>Fee: {formatSOL(tx.fee)} SOL</span>
                          <span>{formatDistanceToNow(new Date(tx.blockTime))} ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(tx.solscanUrl, '_blank')}
                        className="text-galaxy-accent hover:text-galaxy-bright hover:bg-yellow-500/20"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View on Solscan
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-yellow-500/10">
                    <div className="text-xs text-galaxy-muted font-mono break-all">
                      <strong>TX ID:</strong> {tx.signature}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-yellow-500/20">
            <div className="flex items-center justify-between text-sm text-galaxy-muted">
              <p>
                Showing {transactions.length} most recent transactions
              </p>
              <p>
                All TX IDs link to authentic Solscan records
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}