import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useExternalWalletBalances } from '@/hooks/use-external-wallet-balances';
import { useInstantBalance } from '@/hooks/use-instant-balance';
import { TransactionSuccessModal } from './transaction-success-modal';
import { PublicKey } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import { solscanTracker } from '@/lib/solscan-tracker';
import { GoldTokenService } from '@/services/gold-token-service';

export function RealSendTab() {
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'GOLD'>('SOL');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<{
    type: 'send';
    amount: number;
    token: string;
    recipient: string;
    txSignature: string;
  } | null>(null);
  
  const wallet = useExternalWallets();
  const { data: balances } = useExternalWalletBalances();
  const instantBalance = useInstantBalance();
  const { toast } = useToast();

  // Use INSTANT balance that updates immediately when switching wallets
  const selectedBalance = selectedToken === 'SOL' ? 
    instantBalance.balance : 
    (balances?.gold || 0);
    
  // Display current wallet info for transparency
  const walletInfo = wallet.connected && wallet.address ? 
    `${wallet.selectedWallet} - ${wallet.address.slice(0, 8)}...` : 
    'Not connected';

  const handleMaxClick = () => {
    if (selectedToken === 'SOL') {
      // Leave some SOL for transaction fees
      const maxAmount = Math.max(0, selectedBalance - 0.001);
      setAmount(maxAmount.toString());
    } else {
      setAmount(selectedBalance.toString());
    }
  };

  const isValidAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // REAL send transaction using actual wallet balance
  const handleSend = async () => {
    if (!isValidAddress(recipientAddress) || !amount || Number(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid recipient address and amount",
        variant: "destructive"
      });
      return;
    }

    const sendAmount = Number(amount);
    
    // Check REAL balance including transaction fees
    const feeBuffer = selectedToken === 'SOL' ? 0.001 : 0;
    const totalRequired = sendAmount + feeBuffer;
    
    if (selectedToken === 'SOL' && totalRequired > selectedBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Need ${totalRequired.toFixed(6)} SOL (including fees) but only have ${selectedBalance.toFixed(6)} SOL`,
        variant: "destructive"
      });
      return;
    } else if (selectedToken === 'GOLD' && sendAmount > selectedBalance) {
      toast({
        title: "Insufficient Balance", 
        description: `Insufficient GOLD balance. You have ${selectedBalance.toFixed(4)} GOLD`,
        variant: "destructive"
      });
      return;
    }

    if (!wallet.connected || !wallet.address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to send tokens",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      console.log(`Creating REAL send transaction: ${sendAmount} ${selectedToken} to ${recipientAddress}`);
      
      // Get wallet instance for REAL transaction
      const walletInstance = (window as any).phantom?.solana || (window as any).solflare || (window as any).trustwallet?.solana;
      if (!walletInstance) {
        throw new Error('Wallet not found');
      }

      // Create REAL blockchain transaction
      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const connection = new Connection('https://solana.publicnode.com');
      
      const transaction = new Transaction();
      
      if (selectedToken === 'SOL') {
        // REAL SOL transfer using actual wallet balance
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(wallet.address),
            toPubkey: new PublicKey(recipientAddress),
            lamports: sendAmount * LAMPORTS_PER_SOL,
          })
        );
      } else {
        // GOLD token transfer using SPL token service
        console.log('Creating REAL GOLD token transfer...');
        const goldService = new GoldTokenService();
        
        const signature = await goldService.transferGold(
          walletInstance, 
          recipientAddress, 
          sendAmount
        );
        
        // Track GOLD transaction for Solscan
        solscanTracker.trackTransaction({
          signature,
          type: 'send',
          token: 'GOLD',
          amount: sendAmount
        });
        
        solscanTracker.showContractInfo('GOLD');
        console.log('🔗 GOLD Send Transaction on Solscan:', solscanTracker.getSolscanUrl(signature));

        // Set transaction details for success modal
        setCompletedTransaction({
          type: 'send',
          amount: sendAmount,
          token: selectedToken,
          recipient: recipientAddress,
          txSignature: signature
        });
        setShowSuccessModal(true);

        // Clear form
        setRecipientAddress('');
        setAmount('');
        
        toast({
          title: "GOLD Transaction Sent!",
          description: `Successfully sent ${sendAmount} GOLD to ${recipientAddress.slice(0, 8)}...`,
        });
        
        console.log(`🎉 REAL GOLD send successful: ${signature}`);
        return; // Exit early since goldService handles everything
      }

      // Get recent blockhash for REAL transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet.address);
      
      console.log('Requesting wallet signature for REAL transaction...');
      
      // Sign and send REAL transaction with actual wallet
      const signedTransaction = await walletInstance.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      console.log(`REAL transaction sent: ${signature}`);
      
      // Track transaction for Solscan
      solscanTracker.trackTransaction({
        signature,
        type: 'send',
        token: selectedToken,
        amount: sendAmount
      });
      
      // Show contract address info 
      solscanTracker.showContractInfo(selectedToken);
      
      // Wait for confirmation on blockchain
      await connection.confirmTransaction(signature);
      
      console.log('🔗 View on Solscan:', solscanTracker.getSolscanUrl(signature));
      
      // Set REAL transaction details for success modal
      setCompletedTransaction({
        type: 'send',
        amount: sendAmount,
        token: selectedToken,
        recipient: recipientAddress,
        txSignature: signature
      });
      setShowSuccessModal(true);

      // Clear form
      setRecipientAddress('');
      setAmount('');
      
      toast({
        title: "Transaction Sent!",
        description: `Successfully sent ${sendAmount} ${selectedToken} to ${recipientAddress.slice(0, 8)}...`,
      });
      
      console.log(`REAL send successful: ${signature}`);
      
    } catch (error: any) {
      console.error('REAL send failed:', error);
      
      let errorMessage = error.message;
      if (errorMessage?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (errorMessage?.includes('insufficient funds')) {
        errorMessage = 'Insufficient balance for this transaction';
      }
      
      toast({
        title: "Send Failed",
        description: errorMessage || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Token Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">Send Token</label>
        <div className="grid grid-cols-2 gap-2">
          {(['SOL', 'GOLD'] as const).map((token) => (
            <Button
              key={token}
              variant={selectedToken === token ? "default" : "outline"}
              onClick={() => setSelectedToken(token)}
              className="text-sm"
            >
              {token}
            </Button>
          ))}
        </div>
      </div>

      {/* Balance Display */}
      <Card className="bg-galaxy-card border-galaxy-purple/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-galaxy-muted">Available Balance</p>
            <p className="text-2xl font-bold text-galaxy-bright">
              {selectedBalance.toFixed(selectedToken === 'SOL' ? 6 : 4)} {selectedToken}
            </p>
            {wallet.connected && selectedToken === 'SOL' && (
              <p className="text-xs text-galaxy-muted">
                {walletInfo}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipient Address */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">Recipient Address</label>
        <Input
          placeholder="Enter Solana wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-blue-400/30 text-white placeholder:text-gray-400 backdrop-blur-sm"
        />
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-galaxy-bright">Amount</label>
        <div className="relative">
          <Input
            type="number"
            placeholder={`Enter ${selectedToken} amount`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-blue-400/30 text-white placeholder:text-gray-400 pr-16 backdrop-blur-sm"
            step={selectedToken === 'SOL' ? '0.000001' : '0.0001'}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMaxClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-galaxy-accent hover:text-galaxy-bright"
          >
            MAX
          </Button>
        </div>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!wallet.connected || !recipientAddress || !amount || isSending || Number(amount) <= 0 || Number(amount) > selectedBalance}
        className="w-full bg-galaxy-accent hover:bg-galaxy-accent/80 text-white font-semibold"
      >
        {isSending ? 'Sending...' : `Send ${selectedToken}`}
      </Button>

      {/* Connection Status */}
      {!wallet.connected && (
        <p className="text-center text-sm text-galaxy-muted">
          Connect your wallet to send tokens
        </p>
      )}

      {/* Success Modal */}
      {showSuccessModal && completedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-galaxy-card p-6 rounded-lg border border-galaxy-purple/20 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-galaxy-bright mb-4">Transaction Successful!</h3>
            <p className="text-galaxy-muted mb-4">
              Successfully sent {completedTransaction.amount} {completedTransaction.token}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`https://explorer.solana.com/tx/${completedTransaction.txSignature}`, '_blank')}
                className="flex-1"
              >
                View on Explorer
              </Button>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}