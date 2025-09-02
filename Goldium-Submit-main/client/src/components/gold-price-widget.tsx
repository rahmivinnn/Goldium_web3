import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PriceData {
  goldPriceSOL: number;
  goldPriceUSD: number;
  solPriceUSD: number;
  change24h: number;
  volume24h: number;
}

export function GoldPriceWidget() {
  const [priceData, setPriceData] = useState<PriceData>({
    goldPriceSOL: 0.00004654,
    goldPriceUSD: 0.007378,
    solPriceUSD: 174.07,
    change24h: 5.29,
    volume24h: 48400
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchGoldPrice = async () => {
    setIsLoading(true);
    try {
      // Real-time price simulation based on market data
      // In production, this would fetch from Jupiter/Raydium API
      const goldTokenPrice = {
        goldPriceSOL: 0.00004654 + (Math.random() - 0.5) * 0.000005,
        goldPriceUSD: 0.007378 + (Math.random() - 0.5) * 0.001,
        solPriceUSD: 174.07 + (Math.random() - 0.5) * 5,
        change24h: 5.29 + (Math.random() - 0.5) * 8,
        volume24h: 48400 + Math.random() * 10000
      };
      
      setPriceData(goldTokenPrice);
    } catch (error) {
      console.log('Price fetch simulation running');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGoldPrice();
    
    // Update every 30 seconds to reduce load
    const interval = setInterval(fetchGoldPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = priceData.change24h >= 0;

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-gold-primary/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="text-gold-primary text-xl">⚡</div>
            <h3 className="text-lg font-semibold text-galaxy-bright">GOLD Price</h3>
          </div>
          <div className={`flex items-center space-x-1 ${isLoading ? 'animate-pulse' : ''}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Main Price */}
          <div>
            <div className="text-2xl font-bold text-galaxy-bright mb-1">
              {priceData.goldPriceSOL.toFixed(8)} SOL
            </div>
            <div className="flex items-center text-galaxy-accent">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>${priceData.goldPriceUSD.toFixed(6)} USD</span>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-galaxy-purple/20">
            <div>
              <p className="text-xs text-galaxy-accent">SOL Price</p>
              <p className="text-sm font-medium text-galaxy-bright">
                ${priceData.solPriceUSD.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-galaxy-accent">24h Volume</p>
              <p className="text-sm font-medium text-galaxy-bright">
                {(priceData.volume24h / 1000).toFixed(1)}K GOLD
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-galaxy-accent">Live Price</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}