import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriceTickerProps {
  symbols?: string[];
  className?: string;
  showConnectionStatus?: boolean;
}

const DEFAULT_SYMBOLS = ['SOL', 'GOLD'];

export function RealTimePriceTicker({ 
  symbols = DEFAULT_SYMBOLS, 
  className,
  showConnectionStatus = true 
}: PriceTickerProps) {
  const { isConnected, isConnecting, prices, subscribeToPrices } = useWebSocket({
    autoConnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10
  });

  const [animatingPrices, setAnimatingPrices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isConnected) {
      subscribeToPrices(symbols);
    }
  }, [isConnected, symbols, subscribeToPrices]);

  // Animate price changes
  useEffect(() => {
    const newAnimatingPrices = new Set<string>();
    
    prices.forEach((priceData, symbol) => {
      if (animatingPrices.has(symbol)) return;
      
      newAnimatingPrices.add(symbol);
      
      // Remove animation after 1 second
      setTimeout(() => {
        setAnimatingPrices(prev => {
          const updated = new Set(prev);
          updated.delete(symbol);
          return updated;
        });
      }, 1000);
    });
    
    if (newAnimatingPrices.size > 0) {
      setAnimatingPrices(prev => new Set([...prev, ...newAnimatingPrices]));
    }
  }, [prices]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'USDC') {
      return price.toFixed(4);
    } else if (symbol === 'BTC' || symbol === 'GOLD') {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return price.toFixed(2);
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getSymbolIcon = (symbol: string) => {
    switch (symbol) {
      case 'SOL':
        return '◎';
      case 'GOLD':
        return '🥇';
      default:
        return '●';
    }
  };

  return (
    <Card className={cn('p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700', className)}>
      <div className="flex items-center justify-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📈 Live Prices
          {showConnectionStatus && (
            <Badge 
              variant={isConnected ? 'default' : 'destructive'} 
              className={cn(
                'text-xs',
                isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {isConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> Live</>
              ) : isConnecting ? (
                <><WifiOff className="w-3 h-3 mr-1 animate-pulse" /> Connecting...</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
              )}
            </Badge>
          )}
        </h3>
      </div>
      
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl">
        {symbols.map((symbol, index) => {
          const priceData = prices.get(symbol);
          const isAnimating = animatingPrices.has(symbol);
          const isPositive = priceData ? priceData.change24h >= 0 : false;
          
          return (
            <div
              key={symbol}
              className={cn(
                'p-3 rounded-lg border transition-all duration-300 animate-fade-in-up hover:animate-float',
                isAnimating ? 'scale-105 shadow-lg' : 'scale-100',
                priceData 
                  ? isPositive 
                    ? 'bg-green-900/20 border-green-500/30 shadow-green-500/10' 
                    : 'bg-red-900/20 border-red-500/30 shadow-red-500/10'
                  : 'bg-gray-800/50 border-gray-600/30',
                isAnimating && 'ring-2 ring-yellow-400/50'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSymbolIcon(symbol)}</span>
                  <span className="font-semibold text-white text-sm">{symbol}</span>
                </div>
                {priceData && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs',
                    isPositive ? 'text-green-400' : 'text-red-400'
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatChange(priceData.change24h)}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                {priceData ? (
                  <>
                    <div className={cn(
                      'text-lg font-bold transition-colors duration-300',
                      isAnimating ? 'text-yellow-400' : 'text-white'
                    )}>
                      ${formatPrice(priceData.price, symbol)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(priceData.timestamp).toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg font-bold">--</div>
                    <div className="text-xs">No data</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      
      {!isConnected && !isConnecting && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Real-time updates unavailable. Prices may be outdated.</span>
          </div>
        </div>
      )}
    </Card>
  );
}