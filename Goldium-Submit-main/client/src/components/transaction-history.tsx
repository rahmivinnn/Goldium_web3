import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { transactionHistory, TransactionRecord } from '@/lib/transaction-history';
import { useSolanaWallet } from './solana-wallet-provider';
import { clearTransactionHistory, type GoldiumTransactionHistory } from '@/lib/historyUtils';

export function TransactionHistory() {
  const { transactionHistory: newTransactionHistory, refreshTransactionHistory } = useSolanaWallet();
  const [oldTransactions, setOldTransactions] = useState<TransactionRecord[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Get old transactions and update every 15 seconds for compatibility
    const updateOldTransactions = () => {
      const allTransactions = transactionHistory.getTransactions();
      setOldTransactions(allTransactions);
    };

    updateOldTransactions();
    const interval = setInterval(updateOldTransactions, 15000);
    return () => clearInterval(interval);
  }, []);

  // Use new transaction history if available, fallback to old system
  const transactions = newTransactionHistory.length > 0 ? newTransactionHistory : oldTransactions;

  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  // Handle both old and new transaction status formats
  const getStatusIcon = (transaction: any) => {
    const status = transaction.status || (transaction.status === 'success' ? 'confirmed' : transaction.status);
    switch (status) {
      case 'confirmed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'swap':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'send':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'stake':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'unstake':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Clear transaction history
  const handleClearHistory = () => {
    try {
      // Get wallet address from the wallet context
      const walletAddress = (window as any).solana?.publicKey?.toString();
      if (walletAddress) {
        clearTransactionHistory(walletAddress);
        refreshTransactionHistory();
      }
    } catch (error) {
      console.error('Failed to clear transaction history:', error);
    }
  };

  const formatAmount = (amount?: number, token?: string) => {
    if (!amount || !token) return '';
    return `${amount.toFixed(4)} ${token}`;
  };

  // Format timestamp for both old and new formats
  const formatTimestamp = (transaction: any) => {
    const timestamp = transaction.timestamp;
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    } else if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString();
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    return 'Unknown time';
  };

  // Get transaction ID for both formats
  const getTransactionId = (transaction: any) => {
    return transaction.id || transaction.txId || 'unknown';
  };

  // Get Solscan link for both formats
  const getSolscanLink = (transaction: any) => {
    return transaction.solscanLink || transaction.txUrl || `https://solscan.io/tx/${transaction.signature || transaction.txId}`;
  };

  // Format amounts for new transaction format
  const formatNewTransactionAmounts = (tx: GoldiumTransactionHistory) => {
    const parts = [];
    if (tx.amountSOL > 0) parts.push(`${tx.amountSOL.toFixed(4)} SOL`);
    if (tx.amountGOLD > 0) parts.push(`${tx.amountGOLD.toFixed(4)} GOLD`);
    return parts.join(' / ') || 'N/A';
  };

  // Format amounts for old transaction format
  const formatOldTransactionAmounts = (tx: TransactionRecord) => {
    const parts = [];
    if (tx.fromAmount && tx.fromToken) parts.push(`${tx.fromAmount.toFixed(4)} ${tx.fromToken}`);
    if (tx.toAmount && tx.toToken) parts.push(`→ ${tx.toAmount.toFixed(4)} ${tx.toToken}`);
    return parts.join(' ') || 'N/A';
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-galaxy-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-galaxy-bright">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-galaxy-muted text-center py-4">
            No transactions yet. Start swapping, sending, or staking to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-galaxy-card border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-galaxy-bright flex items-center justify-between">
          Transaction History
          <Badge variant="outline" className="bg-blue-500/20 text-galaxy-bright border-blue-500/30">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayTransactions.map((tx: any) => (
          <div
            key={getTransactionId(tx)}
            className="flex items-center justify-between p-4 rounded-lg bg-galaxy-secondary/20 border border-blue-500/10"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(tx)}
              <div>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(tx.type)}>
                    {tx.type.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-galaxy-muted">
                    {/* Handle both new and old transaction formats */}
                    {tx.amountSOL !== undefined ?
                      formatNewTransactionAmounts(tx) :
                      formatOldTransactionAmounts(tx)
                    }
                  </span>
                </div>
                <p className="text-xs text-galaxy-muted mt-1">
                  {formatTimestamp(tx)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getSolscanLink(tx), '_blank')}
                className="h-8 w-8 p-0 hover:bg-blue-500/20"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center gap-4 pt-4">
          {transactions.length > 5 && (
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="border-blue-500/30 hover:bg-blue-500/10"
            >
              {showAll ? 'Show Less' : `Show All ${transactions.length} Transactions`}
            </Button>
          )}

          {/* Clear History Button */}
          {transactions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}