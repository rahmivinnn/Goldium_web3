import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Wallet, Copy, ExternalLink } from 'lucide-react';
import { useSolanaWallet } from './solana-wallet-provider';
import { useToast } from '@/hooks/use-toast';
import { SOLSCAN_BASE_URL } from '@/lib/constants';

export function WalletSelectorDropdown() {
  const { connected, connecting, balance, publicKey, wallet } = useSolanaWallet();
  const walletAddress = publicKey?.toString() || '';
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
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
    window.open(`${SOLSCAN_BASE_URL}/account/${walletAddress}`, '_blank');
  };

  if (!connected) {
    return (
      <Button 
        variant="outline" 
        disabled={connecting}
        className="bg-galaxy-button border-yellow-500/30 text-white"
      >
        {connecting ? 'Connecting...' : 'Wallet Loading...'}
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
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <span className="sm:hidden">Wallet</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-galaxy-card border-yellow-500/30"
      >
        {/* Wallet Info */}
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
              <span className="text-xs text-galaxy-accent">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-galaxy-bright">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 hover:bg-yellow-500/20"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-galaxy-accent">Balance:</span>
              <span className="text-xs font-medium text-galaxy-bright">
                {balance.toFixed(4)} SOL
              </span>
            </div>
          </div>
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

        <DropdownMenuSeparator className="bg-yellow-500/30" />

        {/* Wallet Type Info */}
        <div className="p-4">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-galaxy-gradient/20 rounded-full border border-galaxy-blue/30">
              <span className="text-xs font-medium text-galaxy-blue">{wallet || 'Solana Wallet'}</span>
            </div>
            <p className="text-xs text-galaxy-accent mt-2">
              Connected external wallet
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}