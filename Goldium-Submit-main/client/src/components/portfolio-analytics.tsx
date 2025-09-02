import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, RefreshCw, Wallet, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  assets: {
    symbol: string;
    amount: number;
    value: number;
    change24h: number;
    changePercent24h: number;
    allocation: number;
  }[];
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
  transactions: {
    id: string;
    type: 'buy' | 'sell' | 'swap';
    symbol: string;
    amount: number;
    value: number;
    timestamp: number;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

interface PortfolioAnalyticsProps {
  className?: string;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PortfolioAnalytics({ 
  className,
  userId,
  autoRefresh = true,
  refreshInterval = 30000
}: PortfolioAnalyticsProps) {
  const { isConnected, prices } = useWebSocket({
    autoConnect: true,
    reconnectInterval: 3000
  });

  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Mock portfolio data - in real app, this would come from API
  const mockPortfolioData: PortfolioData = {
    totalValue: 15420.50,
    totalChange24h: 342.75,
    totalChangePercent24h: 2.28,
    assets: [
      {
        symbol: 'SOL',
        amount: 45.2,
        value: 8500.00,
        change24h: 180.50,
        changePercent24h: 2.17,
        allocation: 55.1
      },
      {
        symbol: 'GOLD',
        amount: 1250.0,
        value: 3200.00,
        change24h: 85.20,
        changePercent24h: 2.74,
        allocation: 20.8
      },
      {
        symbol: 'USDC',
        amount: 2500.0,
        value: 2500.00,
        change24h: 0.00,
        changePercent24h: 0.00,
        allocation: 16.2
      },
      {
        symbol: 'BTC',
        amount: 0.025,
        value: 1220.50,
        change24h: 77.05,
        changePercent24h: 6.74,
        allocation: 7.9
      }
    ],
    performance: {
      day: 2.28,
      week: 8.45,
      month: 15.67,
      year: 124.32
    },
    transactions: [
      {
        id: '1',
        type: 'buy',
        symbol: 'SOL',
        amount: 5.0,
        value: 950.00,
        timestamp: Date.now() - 3600000,
        status: 'completed'
      },
      {
        id: '2',
        type: 'swap',
        symbol: 'GOLD',
        amount: 200.0,
        value: 512.00,
        timestamp: Date.now() - 7200000,
        status: 'completed'
      },
      {
        id: '3',
        type: 'sell',
        symbol: 'BTC',
        amount: 0.005,
        value: 244.10,
        timestamp: Date.now() - 10800000,
        status: 'pending'
      }
    ]
  };

  useEffect(() => {
    // Simulate loading portfolio data
    const loadPortfolio = () => {
      setIsLoading(true);
      setTimeout(() => {
        setPortfolioData(mockPortfolioData);
        setIsLoading(false);
        setLastUpdated(Date.now());
      }, 1000);
    };

    loadPortfolio();

    // Auto refresh
    if (autoRefresh) {
      const interval = setInterval(loadPortfolio, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'swap':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('p-6 bg-gray-900/95 border-gray-700', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!portfolioData) {
    return (
      <Card className={cn('p-6 bg-gray-900/95 border-gray-700', className)}>
        <div className="text-center text-gray-400">
          <Wallet className="w-12 h-12 mx-auto mb-4" />
          <p>No portfolio data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Portfolio Overview */}
      <Card className="p-6 bg-gradient-to-r from-yellow-900 to-amber-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              Portfolio Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              <span className="text-xs text-gray-400">
                Updated {formatTimestamp(lastUpdated)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Total Value */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {formatCurrency(portfolioData.totalValue)}
            </div>
            <div className={cn(
              'text-lg font-semibold flex items-center justify-center gap-2',
              portfolioData.totalChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {portfolioData.totalChangePercent24h >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {formatCurrency(Math.abs(portfolioData.totalChange24h))} 
              ({formatPercent(portfolioData.totalChangePercent24h)})
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(portfolioData.performance).map(([period, value]) => (
              <div key={period} className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400 capitalize mb-1">{period}</div>
                <div className={cn(
                  'text-lg font-semibold',
                  value >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {formatPercent(value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card className="p-6 bg-gray-900/95 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {portfolioData.assets.map((asset) => (
            <div key={asset.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{asset.symbol}</span>
                  <Badge variant="outline" className="text-xs">
                    {asset.allocation.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatCurrency(asset.value)}
                  </div>
                  <div className={cn(
                    'text-sm',
                    asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {formatPercent(asset.changePercent24h)}
                  </div>
                </div>
              </div>
              <Progress 
                value={asset.allocation} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6 bg-gray-900/95 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {portfolioData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="text-white font-medium capitalize">
                      {transaction.type} {transaction.symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTimestamp(transaction.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatCurrency(transaction.value)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', getStatusColor(transaction.status))}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}