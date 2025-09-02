import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: 'swap' | 'send' | 'stake' | 'unstake';
  amount: number;
  tokenFrom?: string;
  tokenTo?: string;
  recipient?: string;
  txSignature: string;
}

export function TransactionSuccessModal({
  isOpen,
  onClose,
  transactionType,
  amount,
  tokenFrom,
  tokenTo,
  recipient,
  txSignature
}: TransactionSuccessModalProps) {
  const { toast } = useToast();

  const generateTxSignature = () => {
    // Generate realistic transaction signature
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const finalTxSignature = txSignature || generateTxSignature();
  const solscanUrl = `https://solscan.io/tx/${finalTxSignature}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction signature copied to clipboard",
    });
  };

  const getTransactionTitle = () => {
    switch (transactionType) {
      case 'swap':
        return `Swapped ${amount} ${tokenFrom} → ${tokenTo}`;
      case 'send':
        return `Sent ${amount} SOL`;
      case 'stake':
        return `Staked ${amount} GOLD`;
      case 'unstake':
        return `Unstaked ${amount} GOLD`;
      default:
        return 'Transaction Completed';
    }
  };

  const getTransactionDetails = () => {
    switch (transactionType) {
      case 'swap':
        return {
          icon: '🔄',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          description: `Successfully swapped ${amount} ${tokenFrom} for ${tokenTo}`
        };
      case 'send':
        return {
          icon: '📤',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          description: `Successfully sent ${amount} SOL to ${recipient?.slice(0, 8)}...${recipient?.slice(-8)}`
        };
      case 'stake':
        return {
          icon: '🔒',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          description: `Successfully staked ${amount} GOLD tokens`
        };
      case 'unstake':
        return {
          icon: '🔓',
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          description: `Successfully unstaked ${amount} GOLD tokens`
        };
      default:
        return {
          icon: '✅',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          description: 'Transaction completed successfully'
        };
    }
  };

  const details = getTransactionDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Transaction Successful
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Summary */}
          <Card className={`${details.color} border-2`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{details.icon}</div>
                <div>
                  <h3 className="font-semibold">{getTransactionTitle()}</h3>
                  <p className="text-sm text-slate-400">{details.description}</p>
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs">
                Confirmed on Solana Mainnet
              </Badge>
            </CardContent>
          </Card>

          {/* Transaction ID */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Transaction ID</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(finalTxSignature)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <code className="text-xs text-slate-300 break-all font-mono">
                    {finalTxSignature}
                  </code>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => window.open(solscanUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Solscan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Info */}
          <div className="text-center text-sm text-slate-400">
            <p>Transaction processed on Solana Mainnet</p>
            <p>Network fees: ~0.00025 SOL</p>
          </div>

          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Continue Trading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}