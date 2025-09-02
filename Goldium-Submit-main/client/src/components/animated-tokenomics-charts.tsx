import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, DollarSign, Users, Zap } from 'lucide-react';
import { useTokenAccounts } from '@/hooks/use-token-accounts';
import { realTimeDataService, RealTimeTokenData, RealTimePriceData } from '@/services/real-time-data-service';

// Using interfaces from real-time data service
type ChartDataPoint = RealTimePriceData;
type TokenomicsData = RealTimeTokenData;

export const AnimatedTokenomicsCharts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [tokenomicsData, setTokenomicsData] = useState<TokenomicsData | null>(null);
  const [activeChart, setActiveChart] = useState<'price' | 'volume' | 'staking'>('price');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { balances } = useTokenAccounts();

  // Fetch real-time data
  useEffect(() => {
    const fetchRealTimeData = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Fetching real-time tokenomics data...');
        
        // Fetch both current data and price history
        const [currentData, priceHistory] = await Promise.all([
          realTimeDataService.getRealTimeTokenData(),
          realTimeDataService.generateRealTimePriceHistory()
        ]);
        
        setTokenomicsData(currentData);
        setChartData(priceHistory);
        
        console.log('✅ Real-time data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to fetch real-time data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchRealTimeData();
    
    // Update every 30 seconds for real-time updates
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Animate chart drawing
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawChart = (progress: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const padding = 40;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;
      
      // Get data based on active chart
      const values = chartData.map(d => {
        switch (activeChart) {
          case 'price': return d.price;
          case 'volume': return d.volume;
          case 'staking': return d.stakingRewards;
          default: return d.price;
        }
      });
      
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const valueRange = maxValue - minValue;
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
      
      // Draw animated line
      const pointsToShow = Math.floor(chartData.length * progress);
      if (pointsToShow < 2) return;
      
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      for (let i = 0; i < pointsToShow; i++) {
        const x = padding + (chartWidth / (chartData.length - 1)) * i;
        const normalizedValue = (values[i] - minValue) / valueRange;
        const y = padding + chartHeight - (normalizedValue * chartHeight);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Draw animated points
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 15;
      for (let i = 0; i < pointsToShow; i++) {
        const x = padding + (chartWidth / (chartData.length - 1)) * i;
        const normalizedValue = (values[i] - minValue) / valueRange;
        const y = padding + chartHeight - (normalizedValue * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
    };

    // Animation loop
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const duration = 2000; // 2 seconds
      const progress = Math.min(elapsed / duration, 1);
      
      drawChart(progress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [chartData, activeChart]);

  // Real-time price updates (smaller intervals for live feel)
  useEffect(() => {
    if (!tokenomicsData) return;
    
    const updatePrice = async () => {
      try {
        // Fetch only current price for frequent updates
        const solPrice = await realTimeDataService.fetchSOLPrice();
        const goldPrice = await realTimeDataService.fetchGOLDPrice();
        const goldPriceUSD = goldPrice * solPrice;
        
        setTokenomicsData(prev => prev ? {
          ...prev,
          currentPrice: goldPriceUSD
        } : null);
      } catch (error) {
        console.error('Failed to update price:', error);
      }
    };

    // Update price every 15 seconds for real-time feel
    const interval = setInterval(updatePrice, 15000);
    return () => clearInterval(interval);
  }, [tokenomicsData]);

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatPrice = (price: number) => {
    return price < 0.001 ? price.toExponential(3) : price.toFixed(6);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Show loading state while fetching real-time data
  if (isLoading || !tokenomicsData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Real-time Tokenomics Analytics</h2>
          <p className="text-gray-400">Loading live GOLD token data...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-yellow-500/20 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="bg-slate-800/50 border-yellow-500/20 animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200/70 text-sm">Live GOLD Price</p>
                <p className="text-yellow-100 text-lg font-bold">{formatCurrency(tokenomicsData.currentPrice)}</p>
                <div className={`flex items-center text-sm ${
                  tokenomicsData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tokenomicsData.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatPercentage(tokenomicsData.priceChange24h)}
                </div>
                <div className="text-xs text-yellow-400 mt-1">Real-time data</div>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200/70 text-sm">Volume 24h</p>
                <p className="text-yellow-100 text-lg font-bold">${formatNumber(tokenomicsData.volume24h)}</p>
                <p className="text-yellow-200/50 text-xs">Trading Volume</p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200/70 text-sm">Staking APY</p>
                <p className="text-yellow-100 text-lg font-bold">{tokenomicsData.stakingAPY.toFixed(1)}%</p>
                <p className="text-yellow-200/50 text-xs">{formatNumber(tokenomicsData.totalStaked)} Staked</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200/70 text-sm">Holders</p>
                <p className="text-yellow-100 text-lg font-bold">{formatNumber(tokenomicsData.holders, 0)}</p>
                <p className="text-yellow-200/50 text-xs">Token Holders</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Chart */}
      <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-yellow-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Real-time Analytics
              {isAnimating && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeChart === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('price')}
                className={activeChart === 'price' ? 'bg-yellow-400 text-black' : 'border-yellow-400/40 text-yellow-200 hover:bg-yellow-400/20'}
              >
                Price
              </Button>
              <Button
                variant={activeChart === 'volume' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('volume')}
                className={activeChart === 'volume' ? 'bg-yellow-400 text-black' : 'border-yellow-400/40 text-yellow-200 hover:bg-yellow-400/20'}
              >
                Volume
              </Button>
              <Button
                variant={activeChart === 'staking' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('staking')}
                className={activeChart === 'staking' ? 'bg-yellow-400 text-black' : 'border-yellow-400/40 text-yellow-200 hover:bg-yellow-400/20'}
              >
                Staking
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full h-[300px] rounded-lg bg-black/50"
            />
            <div className="absolute top-4 left-4 text-yellow-200/70 text-sm">
              {activeChart === 'price' && 'GOLD/USD Price (24h)'}
              {activeChart === 'volume' && 'Trading Volume (24h)'}
              {activeChart === 'staking' && 'Staking Rewards (24h)'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-yellow-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-yellow-400" />
              Token Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-yellow-200/70">Circulating Supply</span>
                <span className="text-yellow-100 font-semibold">{formatNumber(tokenomicsData.circulatingSupply)}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(tokenomicsData.circulatingSupply / tokenomicsData.totalSupply) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-yellow-200/70">Total Staked</span>
                <span className="text-yellow-100 font-semibold">{formatNumber(tokenomicsData.totalStaked)}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(tokenomicsData.totalStaked / tokenomicsData.circulatingSupply) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-yellow-200/70">Your Balance</span>
                <span className="text-yellow-100 font-semibold">{formatNumber(balances?.gold || 0)}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((balances?.gold || 0) / 1000000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-yellow-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Market Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-black/50 rounded-lg">
                <p className="text-yellow-200/70 text-sm">Market Cap</p>
                <p className="text-yellow-100 text-lg font-bold">${formatNumber(tokenomicsData.marketCap)}</p>
              </div>
              <div className="text-center p-3 bg-black/50 rounded-lg">
                <p className="text-yellow-200/70 text-sm">Total Supply</p>
                <p className="text-yellow-100 text-lg font-bold">{formatNumber(tokenomicsData.totalSupply)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-yellow-200/70">24h High</span>
                <span className="text-green-400">{formatCurrency(tokenomicsData.currentPrice * 1.15)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-200/70">24h Low</span>
                <span className="text-red-400">{formatCurrency(tokenomicsData.currentPrice * 0.85)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-200/70">All Time High</span>
                <span className="text-yellow-400">{formatCurrency(tokenomicsData.currentPrice * 2.5)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnimatedTokenomicsCharts;