import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Wallet, ExternalLink } from 'lucide-react';

interface WalletConnectionGuideProps {
  walletType?: string;
  showFundingInstructions?: boolean;
}

export function WalletConnectionGuide({ walletType, showFundingInstructions = false }: WalletConnectionGuideProps) {
  const handleGetSolana = () => {
    window.open('https://solana.com/exchanges', '_blank');
  };

  const handleCheckFaucet = () => {
    window.open('https://faucet.solana.com', '_blank');
  };

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
          <div className="space-y-3">
            {!walletType ? (
              <>
                <h3 className="font-semibold text-galaxy-bright">Connect Your Wallet</h3>
                <p className="text-galaxy-accent text-sm">
                  Connect your Solana wallet (Phantom, Solflare, etc.) to view your real balance and start trading.
                </p>
              </>
            ) : showFundingInstructions ? (
              <>
                <h3 className="font-semibold text-galaxy-bright">Your {walletType} wallet has 0 SOL</h3>
                <p className="text-galaxy-accent text-sm">
                  To use this DeFi platform, you need SOL tokens in your wallet for transactions and gas fees.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGetSolana}
                    className="border-galaxy-purple/50 text-galaxy-accent hover:bg-galaxy-purple/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Buy SOL
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCheckFaucet}
                    className="border-galaxy-purple/50 text-galaxy-accent hover:bg-galaxy-purple/20"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Test Faucet
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-galaxy-bright">{walletType} Connected</h3>
                <p className="text-galaxy-accent text-sm">
                  Your wallet is connected. Balances shown are real-time from your {walletType} wallet.
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}