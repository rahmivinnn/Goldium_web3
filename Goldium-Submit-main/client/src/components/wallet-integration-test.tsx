import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMultiWallet } from '@/hooks/use-multi-wallet';
import { useToast } from '@/hooks/use-toast';

export function WalletIntegrationTest() {
  const multiWallet = useMultiWallet();
  const { toast } = useToast();

  const testWalletConnection = async (walletType: 'phantom' | 'solflare' | 'backpack' | 'trust') => {
    try {
      await multiWallet.switchToExternalWallet(walletType);
      toast({
        title: "Success!",
        description: `${walletType} wallet connected successfully`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${walletType}. Make sure the extension is installed.`,
        variant: "destructive",
      });
    }
  };

  const availableWallets = multiWallet.getAvailableExternalWallets();

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30">
      <CardHeader>
        <CardTitle className="text-galaxy-bright">Wallet Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-galaxy-accent">
          Current wallet: {multiWallet.mode === 'self-contained' ? 'Self-Contained' : multiWallet.externalWalletType}
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-galaxy-bright">Available External Wallets:</div>
          {availableWallets.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {availableWallets.map((wallet) => (
                <Button
                  key={wallet}
                  onClick={() => testWalletConnection(wallet)}
                  variant="outline"
                  className="bg-galaxy-button border-galaxy-purple/30 text-white"
                  disabled={multiWallet.connecting}
                >
                  Connect {wallet}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-galaxy-accent">
              No external wallets detected. Install Phantom, Solflare, Backpack, or Trust Wallet to test.
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-galaxy-purple/30">
          <Button
            onClick={() => multiWallet.switchToSelfContained()}
            variant="outline"
            className="bg-galaxy-button border-galaxy-purple/30 text-white"
            disabled={multiWallet.connecting}
          >
            Switch to Self-Contained
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}