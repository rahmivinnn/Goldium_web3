import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MessageCircle, ExternalLink, Globe, Zap, Shield, Coins, DollarSign, Percent, MessageSquare } from 'lucide-react';
import { SolanaIcon } from '@/components/solana-icon';
import { realTimeDataService, RealTimeTokenData } from '@/services/real-time-data-service';

export function TwitterEmbed() {
  const [tokenData, setTokenData] = useState<RealTimeTokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const data = await realTimeDataService.getRealTimeTokenData();
        setTokenData(data);
        console.log('✅ Real community data loaded:', data);
      } catch (error) {
        console.error('❌ Failed to load real community data:', error);
        // Keep trying to fetch real data instead of using mock data
        setTokenData(null);
        
        // Retry after 10 seconds if initial fetch fails
        setTimeout(() => {
          fetchRealData();
        }, 10000);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchRealData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Community Stats - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-2 border-yellow-400/40 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6 text-black" />
        </div>
        <div className="text-2xl font-bold text-yellow-300 mb-1">
          {tokenData ? formatNumber(tokenData.holders) : 'Loading...'}
        </div>
        <div className="text-yellow-200 text-sm">Token Holders</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-2 border-yellow-400/40 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-6 h-6 text-black" />
        </div>
        <div className="text-2xl font-bold text-yellow-300 mb-1">
          {tokenData ? formatCurrency(tokenData.volume24h) : 'Loading...'}
        </div>
        <div className="text-yellow-200 text-sm">24h Volume</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-2 border-yellow-400/40 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all">
           <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
             <DollarSign className="w-6 h-6 text-black" />
           </div>
           <div className="text-2xl font-bold text-yellow-300 mb-1">
             {tokenData ? formatCurrency(tokenData.marketCap) : 'Loading...'}
           </div>
           <div className="text-yellow-200 text-sm">Market Cap</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-2 border-yellow-400/40 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all">
           <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
             <Percent className="w-6 h-6 text-black" />
           </div>
           <div className="text-2xl font-bold text-yellow-300 mb-1">
             {tokenData ? `${tokenData.stakingAPY}%` : 'Loading...'}
           </div>
           <div className="text-yellow-200 text-sm">Staking APY</div>
        </Card>
      </div>
      
      {/* Latest Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Goldium Updates */}
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-2 border-yellow-400/40 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-black" />
              </div>
              <h4 className="text-2xl font-bold text-yellow-300">Goldium Updates</h4>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-yellow-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/40">New</Badge>
                  <span className="text-yellow-200 text-sm">2 hours ago</span>
                </div>
                <h5 className="text-lg font-semibold text-yellow-100 mb-2">Enhanced Security Features</h5>
                <p className="text-yellow-200/80 text-sm leading-relaxed">Implemented advanced multi-signature wallet support and enhanced transaction verification protocols for maximum security.</p>
              </div>
              
              <div className="border-l-4 border-yellow-400/60 pl-4">
                 <div className="flex items-center gap-2 mb-2">
                   <Badge className="bg-yellow-400/10 text-yellow-300/80 border-yellow-400/20">Update</Badge>
                   <span className="text-yellow-200/70 text-sm">1 day ago</span>
                 </div>
                 <h5 className="text-lg font-semibold text-yellow-100/90 mb-2">Improved Swap Performance</h5>
                 <p className="text-yellow-200/70 text-sm leading-relaxed">Optimized swap algorithms resulting in 40% faster transaction processing and reduced gas fees.</p>
              </div>
              
              <div className="border-l-4 border-yellow-400/40 pl-4">
                 <div className="flex items-center gap-2 mb-2">
                   <Badge className="bg-yellow-400/10 text-yellow-300/60 border-yellow-400/20">Feature</Badge>
                   <span className="text-yellow-200/60 text-sm">3 days ago</span>
                 </div>
                 <h5 className="text-lg font-semibold text-yellow-100/80 mb-2">Mobile App Beta Launch</h5>
                 <p className="text-yellow-200/60 text-sm leading-relaxed">Beta version of Goldium mobile app now available for iOS and Android with full DeFi functionality.</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Ecosystem News */}
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-2 border-yellow-400/40 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center">
                <SolanaIcon size={40} className="text-yellow-400" />
              </div>
              <h4 className="text-2xl font-bold text-yellow-300">Solana Ecosystem</h4>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-yellow-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/40">Trending</Badge>
                  <span className="text-yellow-200 text-sm">4 hours ago</span>
                </div>
                <h5 className="text-lg font-semibold text-yellow-100 mb-2">Solana Network Upgrade</h5>
                <p className="text-yellow-200/80 text-sm leading-relaxed">Latest network upgrade brings improved throughput and reduced latency, benefiting all Solana-based applications.</p>
              </div>
              
              <div className="border-l-4 border-yellow-400/60 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-400/10 text-yellow-300/80 border-yellow-400/20">DeFi</Badge>
                  <span className="text-yellow-200/70 text-sm">1 day ago</span>
                </div>
                <h5 className="text-lg font-semibold text-yellow-100/90 mb-2">TVL Reaches New High</h5>
                <p className="text-yellow-200/70 text-sm leading-relaxed">Solana DeFi ecosystem total value locked surpasses $3 billion, showing strong growth and adoption.</p>
              </div>
              
              <div className="border-l-4 border-yellow-400/40 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-400/10 text-yellow-300/60 border-yellow-400/20">Partnership</Badge>
                  <span className="text-yellow-200/60 text-sm">2 days ago</span>
                </div>
                <h5 className="text-lg font-semibold text-yellow-100/80 mb-2">Major Exchange Integration</h5>
                <p className="text-yellow-200/60 text-sm leading-relaxed">Leading cryptocurrency exchanges announce native Solana integration, improving accessibility and liquidity.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Community Highlights */}
      <div className="space-y-8">
        <div className="text-center">
          <h4 className="text-3xl font-bold text-yellow-300 mb-3">Community Highlights</h4>
          <p className="text-yellow-200 text-lg">Key achievements and milestones from our growing community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-2 border-yellow-400/40 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <h5 className="text-xl font-bold text-yellow-300 mb-3">Record Trading Volume</h5>
              <p className="text-yellow-200/80 text-sm leading-relaxed mb-4">Goldium achieved its highest daily trading volume of $500K, demonstrating strong market confidence and liquidity.</p>
              <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/40">Achievement</Badge>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-2 border-yellow-400/40 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h5 className="text-xl font-bold text-yellow-300 mb-3">Community Milestone</h5>
              <p className="text-yellow-200/80 text-sm leading-relaxed mb-4">Reached 25,000 active community members across all platforms, building a strong foundation for future growth.</p>
              <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/40">Milestone</Badge>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-2 border-yellow-400/40 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h5 className="text-xl font-bold text-yellow-300 mb-3">Security Audit Complete</h5>
              <p className="text-yellow-200/80 text-sm leading-relaxed mb-4">Successfully completed comprehensive security audit by leading blockchain security firm with zero critical issues.</p>
              <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/40">Security</Badge>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Join Community Section */}
      <Card className="bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 border-2 border-yellow-400/40 rounded-2xl backdrop-blur-sm">
        <div className="p-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-black" />
          </div>
          <h4 className="text-3xl font-bold text-yellow-300 mb-4">Connect With Our Community</h4>
          <p className="text-yellow-200 text-lg mb-8 max-w-2xl mx-auto">Join thousands of DeFi enthusiasts, traders, and developers building the future of decentralized finance on Solana</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Button 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold px-6 py-4 rounded-xl text-base transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl"
              onClick={() => window.open('https://twitter.com/goldiumofficial', '_blank')}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </div>
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold px-6 py-4 rounded-xl text-base transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl"
              onClick={() => window.open('https://t.me/goldiumofficial', '_blank')}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Telegram
              </div>
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold px-6 py-4 rounded-xl text-base transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl"
              onClick={() => window.open('https://discord.gg/goldium', '_blank')}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Discord
              </div>
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold px-6 py-4 rounded-xl text-base transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl"
              onClick={() => window.open('https://goldium.io', '_blank')}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Website
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}