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
import { useExternalWallets, SupportedWallet } from '@/hooks/use-external-wallets';
import { useToast } from '@/hooks/use-toast';
import { SOLSCAN_BASE_URL } from '@/lib/constants';

interface WalletOption {
  type: SupportedWallet;
  name: string;
  icon: string;
  description: string;
}

// Wallet Logo Components (using emoji fallback for reliability)
const WalletLogos = {
  phantom: '🟣',
  solflare: '🔥', 
  backpack: '🎒',
  trust: '🔷'
};

// Wallet Logo Images (base64 encoded for reliability)
const WalletImages = {
  phantom: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNBQjlGRjIiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0zIDVDMyAyLjc5MDg2IDQuNzkwODYgMSA3IDFIOUM5LjIwOTE0IDEgMTEgMi43OTA4NiAxMSA1VjEzTDguNSAxMUw2IDEzTDMuNSAxMUwzIDEzVjVaIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI2IiBjeT0iNiIgcj0iMSIgZmlsbD0iI0FCOUZGMiIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjYiIHI9IjEiIGZpbGw9IiNBQjlGRjIiLz4KPC9zdmc+Cjwvc3ZnPgo=',
  solflare: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGQzhENEQiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDBMMTIgNEg0TDggMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDE2TDQgMTJIMTJMOCAxNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0wIDhMNCA0VjEyTDAgOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiA4TDEyIDEyVjRMMTYgOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
  backpack: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNFMzNFM0YiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik00IDNDNCAyLjQ0NzcyIDQuNDQ3NzIgMiA1IDJIOUMxMC4xMDQ2IDIgMTEgMi44OTU0MyAxMSAzVjRIMTJDMTIuNTUyMyA0IDEzIDQuNDQ3NzIgMTMgNVYxNEMxMyAxNC41NTIzIDEyLjU1MjMgMTUgMTIgMTVIM0MyLjQ0NzcyIDE1IDIgMTQuNTUyMyAyIDE0VjVDMiA0LjQ0NzcyIDIuNDQ3NzIgNCAzIDRINFYzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTYgM1Y0SDlWM0M5IDIuNDQ3NzIgOC41NTIyOCAyIDggMkg3QzYuNDQ3NzIgMiA2IDIuNDQ3NzIgNiAzWiIgZmlsbD0iI0UzM0UzRiIvPgo8cmVjdCB4PSI1IiB5PSI3IiB3aWR0aD0iNiIgaGVpZ2h0PSIxIiBmaWxsPSIjRTMzRTNGIi8+Cjwvc3ZnPgo8L3N2Zz4K',
  trust: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMzMzc1QkIiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDBMMTQgM1Y5QzE0IDEzLjUgMTEgMTcuMjYgOCAxOEM1IDE3LjI2IDIgMTMuNSAyIDlWM0w4IDBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNiA5TDcuNSAxMC41TDEwLjUgNy41IiBzdHJva2U9IiMzMzc1QkIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'
};

const walletOptions: WalletOption[] = [
  {
    type: 'phantom',
    name: 'Phantom',
    icon: 'phantom',
    description: 'Most popular Solana wallet',
  },
  {
    type: 'solflare',
    name: 'Solflare',
    icon: 'solflare',
    description: 'Feature-rich Solana wallet',
  },
  {
    type: 'backpack',
    name: 'Backpack',
    icon: 'backpack',
    description: 'Modern crypto wallet',
  },
  {
    type: 'trust',
    name: 'Trust Wallet',
    icon: 'trust',
    description: 'Secure multi-coin wallet',
  },
];

export function ExternalWalletSelector() {
  const wallet = useExternalWallets();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const availableWallets = wallet.getAvailableWallets();
  const currentWallet = walletOptions.find(w => w.type === wallet.selectedWallet);

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    if (!wallet.address) return;
    
    try {
      await navigator.clipboard.writeText(wallet.address);
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
    if (!wallet.address) return;
    window.open(`${SOLSCAN_BASE_URL}/account/${wallet.address}`, '_blank');
  };

  // Handle wallet selection with forced popup
  const handleWalletSelect = async (walletType: SupportedWallet) => {
    if (wallet.selectedWallet === walletType) {
      setIsOpen(false);
      return;
    }

    // Show connecting state immediately
    setIsOpen(false);
    
    try {
      // Show switching message if already connected to another wallet
      if (wallet.connected && wallet.selectedWallet) {
        toast({
          title: "Switching Wallets",
          description: `Switching from ${walletOptions.find(w => w.type === wallet.selectedWallet)?.name} to ${walletOptions.find(w => w.type === walletType)?.name}`,
        });
      }
      
      // Direct wallet connection through our hook only - avoid double connection
      await wallet.connectWallet(walletType);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletOptions.find(w => w.type === walletType)?.name}`,
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || `Please approve the connection in your ${walletOptions.find(w => w.type === walletType)?.name} extension popup`,
        variant: "destructive",
      });
    }
  };

  // Show connect button if not connected
  if (!wallet.connected) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            disabled={wallet.connecting}
            className="chainzoku-btn bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-semibold border-none shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 hover:scale-[1.02] transition-all duration-300 font-['Inter'] tracking-wide"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {wallet.connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-black/95 border-cyan-400/30 backdrop-blur-xl z-50 shadow-2xl shadow-cyan-400/20 rounded-xl"
        >
          <DropdownMenuLabel className="text-white px-4 py-3 font-['Space_Grotesk'] font-bold text-base tracking-tight">Connect Your Wallet</DropdownMenuLabel>
          
          <div className="p-2 space-y-1">
            {walletOptions.map((walletOption) => {
              const isAvailable = availableWallets.includes(walletOption.type);
              
              return (
                <DropdownMenuItem
                  key={walletOption.type}
                  onClick={() => isAvailable && handleWalletSelect(walletOption.type)}
                  className={`
                    text-white hover:bg-cyan-400/10 hover:border-cyan-400/40 cursor-pointer p-4 rounded-xl transition-all duration-300 border border-transparent
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-[1.02]'}
                  `}
                  disabled={!isAvailable}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        <img 
                          src={WalletImages[walletOption.icon as keyof typeof WalletImages]} 
                          alt={walletOption.name} 
                          className="w-6 h-6 rounded-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{walletOption.name}</div>
                        <div className="text-xs text-slate-400">{walletOption.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isAvailable ? (
                        <span className="text-xs text-cyan-400 px-2 py-1 bg-cyan-500/20 rounded">
                          Available
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700/50 rounded">
                          Not Found
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>

          {availableWallets.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-300 border-t border-cyan-500/30 mt-2">
              <p className="mb-2">No wallet extensions found.</p>
              <p className="text-xs">Please install and refresh the page:</p>
              <div className="text-xs mt-1 space-y-1">
                <div>• Phantom Wallet</div>
                <div>• Solflare Wallet</div>
                <div>• Backpack Wallet</div>
                <div>• Trust Wallet</div>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show connected wallet info
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="bg-slate-800/30 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/70 text-white hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300"
        >
          <div className="mr-2 flex items-center justify-center w-5 h-5">
            {currentWallet ? (
                <img 
                  src={WalletImages[currentWallet.icon as keyof typeof WalletImages]} 
                  alt={currentWallet.name} 
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
          </div>
          <span className="hidden sm:inline">
            {wallet.address ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : 'Wallet'}
          </span>
          <span className="sm:hidden">{currentWallet?.name || 'Connected'}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-black/70 border-yellow-400/40"
      >
        {/* Connected Wallet Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-100">Connected Wallet</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-xs text-yellow-400">Active</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-200/70">Wallet:</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-4 h-4">
                  {currentWallet ? (
                  <img 
                    src={WalletImages[currentWallet.icon as keyof typeof WalletImages]} 
                    alt={currentWallet.name} 
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <Wallet className="w-3 h-3" />
                )}
                </div>
                <span className="text-xs text-yellow-100">{currentWallet?.name || 'Unknown Wallet'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-200/70">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-yellow-100">
                  {wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}` : 'N/A'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 hover:bg-yellow-400/20"
                  disabled={!wallet.address}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-200/70">Balance:</span>
              <span className="text-xs font-medium text-yellow-100">
                {wallet.balance.toFixed(4)} SOL
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-yellow-400/30" />

        {/* Switch Wallet */}
        <DropdownMenuLabel className="text-yellow-100 px-4">Switch Wallet</DropdownMenuLabel>
        
        <div className="p-2 space-y-1">
          {walletOptions.map((walletOption) => {
            const isAvailable = availableWallets.includes(walletOption.type);
            const isSelected = wallet.selectedWallet === walletOption.type;
            
            return (
              <DropdownMenuItem
                key={walletOption.type}
                onClick={() => isAvailable && !isSelected && handleWalletSelect(walletOption.type)}
                className={`
                  text-yellow-100 hover:bg-yellow-500/20 cursor-pointer p-3 rounded-md
                  ${isSelected ? 'bg-yellow-500/30' : ''}
                  ${!isAvailable ? 'opacity-50' : ''}
                `}
                disabled={!isAvailable || isSelected}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      <img 
                        src={WalletImages[walletOption.icon as keyof typeof WalletImages]} 
                        alt={walletOption.name} 
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{walletOption.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <span className="text-xs text-yellow-200/70">{walletOption.description}</span>
                    </div>
                  </div>
                  {!isAvailable && (
                    <span className="text-xs text-yellow-200/70">Not Detected</span>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="bg-yellow-400/30" />

        {/* Wallet Actions */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={copyAddress}
            className="text-yellow-100 hover:bg-yellow-500/20 cursor-pointer"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={viewOnSolscan}
            className="text-yellow-100 hover:bg-yellow-500/20 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Solscan
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={wallet.disconnectWallet}
            className="text-red-400 hover:bg-red-500/20 cursor-pointer"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </div>

        {/* Network Info */}
        <DropdownMenuSeparator className="bg-yellow-400/30" />
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