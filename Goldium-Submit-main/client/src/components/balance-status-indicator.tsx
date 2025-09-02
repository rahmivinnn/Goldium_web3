import { CheckCircle, XCircle, AlertCircle, Wallet } from 'lucide-react';

interface BalanceStatusIndicatorProps {
  connected: boolean;
  balance: number;
  walletType?: string;
}

export function BalanceStatusIndicator({ connected, balance, walletType }: BalanceStatusIndicatorProps) {
  if (!connected) {
    return (
      <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl transition-all duration-300 hover:border-red-400/50">
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium text-red-300 tracking-wide">Not Connected</span>
      </div>
    );
  }

  const hasBalance = balance > 0;
  const formattedBalance = balance.toFixed(4);
  const usdValue = (balance * 195.5).toFixed(2);

  return (
    <div className={`flex items-center space-x-3 px-4 py-2 backdrop-blur-sm border rounded-xl transition-all duration-300 hover:scale-105 ${
      hasBalance 
        ? 'bg-gradient-to-r from-emerald-500/10 to-green-600/20 border-emerald-500/30 hover:border-emerald-400/50' 
        : 'bg-gradient-to-r from-amber-500/10 to-yellow-600/20 border-amber-500/30 hover:border-amber-400/50'
    }`}>
      <div className="flex items-center space-x-2">
        <Wallet className="w-4 h-4 text-blue-400" />
        {hasBalance ? (
          <CheckCircle className="w-3 h-3 text-emerald-400" />
        ) : (
          <AlertCircle className="w-3 h-3 text-amber-400" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-semibold tracking-wide ${
          hasBalance ? 'text-emerald-300' : 'text-amber-300'
        }`}>
          {walletType?.charAt(0).toUpperCase()}{walletType?.slice(1)}
        </span>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono ${
            hasBalance ? 'text-emerald-200' : 'text-amber-200'
          }`}>
            {formattedBalance} SOL
          </span>
          <span className="text-xs text-gray-400">≈ ${usdValue}</span>
        </div>
      </div>
    </div>
  );
}