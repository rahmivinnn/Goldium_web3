import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Wallet, Copy, ExternalLink, Check } from 'lucide-react';
import { useMultiWallet } from '@/hooks/use-multi-wallet';
import { useToast } from '@/hooks/use-toast';
import { SOLSCAN_BASE_URL } from '@/lib/constants';
import { ExternalWalletType } from '@/lib/external-wallet-service';

type WalletType = 'self-contained' | 'phantom' | 'solflare' | 'backpack' | 'trust';

interface WalletOption {
  type: WalletType;
  name: string;
  icon: string;
  description: string;
}

const walletOptions: WalletOption[] = [
  {
    type: 'self-contained',
    name: 'Self-Contained Wallet',
    icon: '🔐',
    description: 'Built-in wallet with dedicated private key',
  },
  {
    type: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Connect to Phantom wallet extension',
  },
  {
    type: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    description: 'Connect to Solflare wallet',
  },
  {
    type: 'backpack',
    name: 'Backpack',
    icon: '🎒',
    description: 'Connect to Backpack wallet',
  },
  {
    type: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Connect to Trust Wallet',
  },
];

export function MultiWalletSelector() {
  const multiWallet = useMultiWallet();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedWallet: WalletType = multiWallet.mode === 'self-contained' ? 'self-contained' : (multiWallet.externalWalletType as WalletType);

  // Get available wallets
  const availableExternalWallets = multiWallet.getAvailableExternalWallets();
  const availableWallets: WalletType[] = ['self-contained', ...availableExternalWallets];

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    if (!multiWallet.address) return;
    
    try {
      await navigator.clipboard.writeText(multiWallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // View wallet on Solscan
  const viewOnSolscan = () => {
    if (!multiWallet.address) return;
    window.open(`${SOLSCAN_BASE_URL}/account/${multiWallet.address}`, '_blank');
  };

  // Handle wallet selection
  const handleWalletSelect = async (walletType: WalletType) => {
    if (selectedWallet === walletType) {
      setIsOpen(false);
      return;
    }

    try {
      if (walletType === 'self-contained') {
        await multiWallet.switchToSelfContained();
        toast({
          title: "Wallet Switched",
          description: "Switched to self-contained wallet",
        });
      } else {
        await multiWallet.switchToExternalWallet(walletType as ExternalWalletType);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${walletOptions.find(w => w.type === walletType)?.name}`,
        });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${walletOptions.find(w => w.type === walletType)?.name}. Please make sure the wallet extension is installed and unlocked.`,
        variant: "destructive",
      });
    }
  };

  const currentWallet = walletOptions.find(w => w.type === selectedWallet);

  if (!multiWallet.connected) {
    return (
      <Button 
        variant="outline" 
        disabled={multiWallet.connecting}
        className="bg-galaxy-button border-yellow-500/30 text-white"
      >
        {multiWallet.connecting ? 'Connecting...' : 'Wallet Loading...'}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="bg-galaxy-card border-yellow-500/30 hover:border-yellow-500/50 text-galaxy-bright"
        >
          <span className="mr-2">{currentWallet?.icon}</span>
          <span className="hidden sm:inline">
            {multiWallet.address ? `${multiWallet.address.slice(0, 4)}...${multiWallet.address.slice(-4)}` : 'Wallet'}
          </span>
          <span className="sm:hidden">Wallet</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-galaxy-card border-yellow-500/30"
      >
        {/* Current Wallet Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-galaxy-bright">Connected Wallet</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-galaxy-accent">Current:</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs">{currentWallet?.icon}</span>
                <span className="text-xs text-galaxy-bright">{currentWallet?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-galaxy-accent">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-galaxy-bright">
                  {multiWallet.address ? `${multiWallet.address.slice(0, 8)}...${multiWallet.address.slice(-8)}` : 'N/A'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 hover:bg-yellow-500/20"
                  disabled={!multiWallet.address}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-galaxy-accent">Balance:</span>
              <span className="text-xs font-medium text-galaxy-bright">
                {multiWallet.balance.toFixed(4)} SOL
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-yellow-500/30" />

        {/* Wallet Selection */}
        <DropdownMenuLabel className="text-galaxy-bright px-4">Select Wallet</DropdownMenuLabel>
        
        <div className="p-2 space-y-1">
          {walletOptions.map((wallet) => (
            <DropdownMenuItem
              key={wallet.type}
              onClick={() => handleWalletSelect(wallet.type)}
              className={`
                text-galaxy-bright hover:bg-yellow-500/20 cursor-pointer p-3 rounded-md
        ${selectedWallet === wallet.type ? 'bg-yellow-500/30' : ''}
                ${!availableWallets.includes(wallet.type) ? 'opacity-50' : ''}
              `}
              disabled={!availableWallets.includes(wallet.type)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{wallet.icon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{wallet.name}</span>
                      {selectedWallet === wallet.type && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <span className="text-xs text-galaxy-accent">{wallet.description}</span>
                  </div>
                </div>
                {!availableWallets.includes(wallet.type) && (
                  <span className="text-xs text-galaxy-accent">Not Detected</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-yellow-500/30" />

        {/* Wallet Actions */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={copyAddress}
            className="text-galaxy-bright hover:bg-yellow-500/20 cursor-pointer"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={viewOnSolscan}
            className="text-galaxy-bright hover:bg-yellow-500/20 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Solscan
          </DropdownMenuItem>
        </div>

        {/* Network Info */}
        <DropdownMenuSeparator className="bg-yellow-500/30" />
        <div className="p-4">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="text-xs font-medium text-green-400">Solana Mainnet</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}