import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { solscanTracker } from '@/lib/solscan-tracker';
import { useGoldBalance } from '@/hooks/use-gold-balance';
import { AlertCircle, Send, Coins } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logoImage from '@assets/k1xiYLna_400x400-removebg-preview_1754140723127.png';

export function GoldSendTab() {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const goldBalance = useGoldBalance();

  const handleSend = async () => {
    if (!toAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (sendAmount > goldBalance.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${goldBalance.balance.toFixed(4)} GOLD`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const signature = await goldBalance.transferGold(toAddress.trim(), sendAmount);
      
      // Track transaction for Solscan
      solscanTracker.trackTransaction({
        signature,
        type: 'send',
        token: 'GOLD',
        amount: sendAmount
      });
      
      solscanTracker.showContractInfo('GOLD');
      
      toast({
        title: "Transfer Successful!",
        description: `Sent ${sendAmount} GOLD. Transaction: ${signature.slice(0, 8)}...`,
      });
      
      console.log('🔗 GOLD Send Transaction on Solscan:', solscanTracker.getSolscanUrl(signature));

      // Clear form
      setToAddress('');
      setAmount('');
      
    } catch (error: any) {
      console.error('GOLD transfer failed:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to send GOLD tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maxAmount = () => {
    setAmount(goldBalance.balance.toString());
  };

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-galaxy-bright">
          <img 
            src={logoImage} 
            alt="GOLD" 
            className="w-6 h-6"
          />
          Send GOLD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-galaxy-purple/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-galaxy-text">Available Balance:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-galaxy-bright">
                {goldBalance.balance.toFixed(4)}
              </span>
              <span className="text-galaxy-text">GOLD</span>
            </div>
          </div>
          <div className="text-right text-sm text-galaxy-accent mt-1">
            ≈ ${(goldBalance.balance * 20).toFixed(2)} USD
          </div>
        </div>

        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-galaxy-bright">
            Recipient Address
          </Label>
          <Input
            id="recipient"
            placeholder="Enter Solana wallet address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-blue-400/30 text-white placeholder:text-gray-400 backdrop-blur-sm"
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-galaxy-bright">
            Amount (GOLD)
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-blue-400/30 text-white placeholder:text-gray-400 pr-16 backdrop-blur-sm"
              step="0.0001"
              min="0"
              max={goldBalance.balance}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={maxAmount}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-galaxy-blue hover:text-galaxy-bright"
            >
              MAX
            </Button>
          </div>
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="text-sm text-galaxy-accent">
              ≈ ${(parseFloat(amount) * 20).toFixed(2)} USD
            </div>
          )}
        </div>

        {/* Warning */}
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            GOLD transfers are irreversible. Please verify the recipient address carefully.
          </AlertDescription>
        </Alert>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isLoading || !toAddress.trim() || !amount || goldBalance.balance === 0}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send GOLD
            </div>
          )}
        </Button>

        {/* Transaction Info */}
        <div className="text-xs text-galaxy-text space-y-1">
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="text-galaxy-accent">Solana Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span>Transaction Fee:</span>
            <span className="text-galaxy-accent">~0.000005 SOL</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}