import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useExternalWalletBalances } from '@/hooks/use-external-wallet-balances';
import { PublicKey } from '@solana/web3.js';

export function SendTab() {
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'GOLD'>('SOL');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  
  const wallet = useExternalWallets();
  const { data: balances, refetch } = useExternalWalletBalances();
  const { connected } = wallet;
  const [isLoading, setIsLoading] = useState(false);

  const selectedBalance = selectedToken === 'SOL' ? (balances?.sol || 0) : (balances?.gold || 0);

  // Utility functions
  const validateAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const sendSol = async (address: string, amount: number) => {
    // Placeholder implementation
    console.log(`Sending ${amount} SOL to ${address}`);
    return { success: true };
  };

  const sendToken = async (address: string, amount: number) => {
    // Placeholder implementation  
    console.log(`Sending ${amount} GOLD to ${address}`);
    return { success: true };
  };

  const handleMaxClick = () => {
    if (selectedToken === 'SOL') {
      // Leave some SOL for transaction fees
      const maxAmount = Math.max(0, selectedBalance - 0.01);
      setAmount(maxAmount.toString());
    } else {
      setAmount(selectedBalance.toString());
    }
  };

  const handleSend = async () => {
    if (!connected || !recipientAddress || !amount) return;

    const sendAmount = Number(amount);
    if (sendAmount <= 0 || sendAmount > selectedBalance) return;

    if (!validateAddress(recipientAddress)) {
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (selectedToken === 'SOL') {
        result = await sendSol(recipientAddress, sendAmount);
      } else {
        result = await sendToken(recipientAddress, sendAmount);
      }

      if (result.success) {
        setRecipientAddress('');
        setAmount('');
        refetch();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAmount = amount && Number(amount) > 0 && Number(amount) <= selectedBalance;
  const isValidAddress = recipientAddress && validateAddress(recipientAddress);

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Token Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-100">Select Token</label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedToken === 'SOL' ? 'default' : 'outline'}
            className={`p-4 h-auto flex-col ${
              selectedToken === 'SOL'
                ? 'bg-blue-gradient hover:from-blue-600 hover:to-blue-700'
                : 'bg-defi-accent hover:bg-blue-gradient border-defi-accent'
            }`}
            onClick={() => setSelectedToken('SOL')}
          >
            <div className="text-2xl mb-2">◎</div>
            <p className="font-medium">SOL</p>
            <p className="text-xs opacity-80">{balances.sol.toFixed(4)}</p>
          </Button>
          <Button
            variant={selectedToken === 'GOLD' ? 'default' : 'outline'}
            className={`p-4 h-auto flex-col ${
              selectedToken === 'GOLD'
                ? 'bg-gold-gradient hover:from-gold-secondary hover:to-yellow-600 text-defi-dark'
                : 'bg-defi-accent hover:bg-gold-gradient border-defi-accent'
            }`}
            onClick={() => setSelectedToken('GOLD')}
          >
            <div className="text-2xl mb-2">⚡</div>
            <p className="font-medium">GOLD</p>
            <p className="text-xs opacity-80">{balances.gold.toFixed(4)}</p>
          </Button>
        </div>
      </div>

      {/* Recipient Address */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-100">Recipient Address</label>
        <Input
          placeholder="Enter Solana wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className={`bg-defi-accent/50 border-defi-accent focus:border-blue-primary ${
            recipientAddress && !isValidAddress ? 'border-red-500' : ''
          }`}
        />
        {recipientAddress && !isValidAddress && (
          <p className="text-red-500 text-xs">Invalid Solana address</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-100">Amount</label>
        <Card className="bg-defi-accent/50 border-defi-accent">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300">
                Available: {selectedBalance.toFixed(4)} {selectedToken}
              </span>
              <Button
                variant="link"
                size="sm"
                className="text-blue-primary hover:underline p-0 h-auto"
                onClick={handleMaxClick}
              >
                Max
              </Button>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-xl font-semibold border-none p-0 h-auto"
            />
          </CardContent>
        </Card>
      </div>

      {/* Send Button */}
      <Button
        className="w-full bg-blue-gradient hover:from-blue-600 hover:to-blue-700 py-4 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        onClick={handleSend}
        disabled={!connected || !isValidAmount || !isValidAddress || isLoading}
      >
        {isLoading ? 'Sending...' : `Send ${selectedToken}`}
      </Button>
    </div>
  );
}
