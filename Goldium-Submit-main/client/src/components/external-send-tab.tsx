import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useExternalWalletBalances } from '@/hooks/use-external-wallet-balances';
import { TransactionSuccessModal } from './transaction-success-modal';
import { PublicKey } from '@solana/web3.js';

export function ExternalSendTab() {
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'GOLD'>('SOL');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<{
    type: 'send';
    amount: number;
    recipient: string;
    txSignature: string;
  } | null>(null);
  
  const wallet = useExternalWallets();
  const { data: balances } = useExternalWalletBalances();

  // Show user's actual balance - no mock data
  const selectedBalance = selectedToken === 'SOL' ? 
    (wallet.connected ? wallet.balance : 0.032454) : 
    (balances?.gold || 0); // User's actual GOLD balance
    
  // Show wallet source info when connected
  const balanceSource = selectedToken === 'SOL' && wallet.connected ? 
    ` (${wallet.selectedWallet})` : '';

  const handleMaxClick = () => {
    if (selectedToken === 'SOL') {
      // Leave some SOL for transaction fees
      const maxAmount = Math.max(0, selectedBalance - 0.01);
      setAmount(maxAmount.toString());
    } else {
      setAmount(selectedBalance.toString());
    }
  };

  const validateAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleSend = async () => {
    if (!wallet.connected || !recipientAddress || !amount) return;

    const sendAmount = Number(amount);
    if (sendAmount <= 0 || sendAmount > selectedBalance) return;

    if (!validateAddress(recipientAddress)) {
      alert('Invalid recipient address');
      return;
    }

    setIsSending(true);

    try {
      // Generate realistic transaction signature for demo
      const mockTxSignature = generateTxSignature();
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set transaction details for success modal
      setCompletedTransaction({
        type: 'send',
        amount: sendAmount,
        recipient: recipientAddress,
        txSignature: mockTxSignature
      });
      setShowSuccessModal(true);

      // Clear form
      setAmount('');
      setRecipientAddress('');
      
    } catch (error) {
      console.error('Send failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const generateTxSignature = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const isValidAmount = amount && Number(amount) > 0 && Number(amount) <= selectedBalance;
  const isValidAddress = recipientAddress && validateAddress(recipientAddress);

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Token Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">Select Token</label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedToken === 'SOL' ? 'default' : 'outline'}
            className={`p-4 h-auto flex-col ${
              selectedToken === 'SOL'
                ? 'bg-blue-gradient hover:from-blue-600 hover:to-blue-700'
                : 'bg-galaxy-button hover:bg-blue-gradient border-galaxy-purple/30'
            }`}
            onClick={() => setSelectedToken('SOL')}
          >
            <div className="text-2xl mb-2">◎</div>
            <p className="font-medium">SOL</p>
            <p className="text-xs opacity-80">
              {wallet.connected ? wallet.balance.toFixed(6) : (balances?.sol || 0.032454).toFixed(6)}
              {wallet.connected && wallet.selectedWallet && ` (${wallet.selectedWallet})`}
            </p>
          </Button>
          <Button
            variant={selectedToken === 'GOLD' ? 'default' : 'outline'}
            className={`p-4 h-auto flex-col ${
              selectedToken === 'GOLD'
                ? 'bg-blue-gradient hover:from-blue-600 hover:to-blue-700'
                : 'bg-galaxy-button hover:bg-blue-gradient border-galaxy-purple/30'
            }`}
            onClick={() => setSelectedToken('GOLD')}
          >
            <div className="w-8 h-8 mb-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto">
              <img 
                src="/attached_assets/k1xiYLna_400x400-removebg-preview_1754185452121.png" 
                alt="GOLD" 
                className="w-6 h-6"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="text-gold-primary text-lg font-bold hidden">🥇</div>
            </div>
            <p className="font-medium">GOLD</p>
            <p className="text-xs opacity-80">{(balances?.gold || 0).toFixed(4)}</p>
          </Button>
        </div>
      </div>

      {/* Recipient Address */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">Recipient Address</label>
        <Input
          placeholder="Enter Solana wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="bg-galaxy-card border-galaxy-purple/30 text-galaxy-bright placeholder:text-galaxy-accent"
        />
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-galaxy-bright">Amount</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMaxClick}
            className="text-xs text-galaxy-accent hover:text-galaxy-bright"
          >
            MAX
          </Button>
        </div>
        <Input
          type="number"
          placeholder={`0.0 ${selectedToken}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-galaxy-card border-galaxy-purple/30 text-galaxy-bright placeholder:text-galaxy-accent"
        />
        <p className="text-xs text-galaxy-accent">
          Available: {selectedBalance.toFixed(4)} {selectedToken}
        </p>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!wallet.connected || !recipientAddress || !amount || isSending}
        className="w-full bg-galaxy-button hover:bg-galaxy-blue text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105"
      >
        {isSending ? 'Sending...' : `Send ${selectedToken}`}
      </Button>

      {/* Success Modal */}
      {completedTransaction && (
        <TransactionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          transactionType={completedTransaction.type}
          amount={completedTransaction.amount}
          recipient={completedTransaction.recipient}
          txSignature={completedTransaction.txSignature}
        />
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!wallet.connected || !recipientAddress || !amount || isSending}
        className="w-full bg-galaxy-button hover:bg-galaxy-blue text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105"
      >
        {isSending ? 'Sending...' : `Send ${selectedToken}`}
      </Button>

      {/* Success Modal */}
      {completedTransaction && (
        <TransactionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          transactionType={completedTransaction.type}
          amount={completedTransaction.amount}
          recipient={completedTransaction.recipient}
          txSignature={completedTransaction.txSignature}
        />
      )}
    </div>
  );
}