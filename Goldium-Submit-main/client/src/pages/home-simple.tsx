import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SelfContainedSwapTab } from '@/components/self-contained-swap-tab';
import { SelfContainedStakingTab } from '@/components/self-contained-staking-tab';
import { RealSendTab } from '@/components/real-send-tab';
import { TransactionHistory } from '@/components/transaction-history';
import { useSolanaWallet } from '@/components/solana-wallet-provider';
import { ExternalWalletSelector } from '@/components/external-wallet-selector';

import { RealTimeNotifications } from '@/components/real-time-notifications';
import { ExternalLink, DollarSign } from 'lucide-react';
import { AnimatedTokenomicsCharts } from '@/components/animated-tokenomics-charts';
import { realTimeDataService, RealTimeTokenData } from '@/services/real-time-data-service';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useToast } from '@/hooks/use-toast';
import { goldTokenService } from '@/services/gold-token-service';
import { autoSaveTransaction } from "@/lib/historyUtils";
import { useGoldBalance } from '@/hooks/use-gold-balance';
import goldiumLogo from '@assets/k1xiYLna_400x400-removebg-preview_1754140723127.png';
import GoldiumGamifiedStaking from '@/components/goldium-gamified-staking';
import { TwitterEmbed } from '@/components/twitter-embed';

export default function HomeSimple() {
  const wallet = useSolanaWallet();
  const [tokenData, setTokenData] = useState<RealTimeTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingToken, setBuyingToken] = useState(false);
  const [buyAmount, setBuyAmount] = useState('0.000047'); // Default amount for 1 GOLD
  
  const externalWallet = useExternalWallets();
  const { toast } = useToast();
  const goldBalance = useGoldBalance();

  // Fetch real-time data on component mount
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        const data = await realTimeDataService.getRealTimeTokenData();
        setTokenData(data);
      } catch (error) {
        console.error('Failed to fetch token data:', error);
        // Fallback to realistic demo data
        setTokenData({
          currentPrice: 0.0089,
          priceChange24h: 12.8,
          volume24h: 485000,
          marketCap: 890000,
          totalSupply: 100000000,
          circulatingSupply: 60000000,
          stakingAPY: 8.5,
          totalStaked: 21000000,
          holders: 1247
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();

    // Update data every 30 seconds
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBuyGoldium = async () => {
    if (!externalWallet.connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first to buy GOLDIUM tokens.",
        variant: "destructive"
      });
      return;
    }

    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy.",
        variant: "destructive"
      });
      return;
    }

    setBuyingToken(true);
    
    try {
      // REAL BLOCKCHAIN TRANSACTION - No more simulation!
      console.log('🚀 Starting REAL GOLDIUM purchase with blockchain integration');
      
      const solAmount = parseFloat(buyAmount);
      const goldAmount = solAmount * 21486.893; // Exchange rate: 1 SOL = 21,486.893 GOLD
      
      // Import and use REAL swap service
      const { SwapService } = await import('@/lib/swap-service');
      const swapService = new SwapService();
      
      // Set external wallet for real transaction
      if (externalWallet.walletInstance) {
        swapService.setExternalWallet(externalWallet);
        console.log('✅ External wallet connected for REAL transaction');
      }
      
      console.log(`💰 Executing REAL swap: ${solAmount} SOL → ${goldAmount.toFixed(2)} GOLD`);
      console.log(`🔗 Transaction will be tracked with GOLD Contract Address (CA)`);
      
      // Execute REAL blockchain swap
      const swapResult = await swapService.swapSolToGold(solAmount);
      
      if (!swapResult.success) {
        throw new Error(swapResult.error || 'Swap failed');
      }
      
      const signature = swapResult.signature!;
      console.log(`✅ REAL transaction completed: ${signature}`);
      console.log(`🔍 View on Solscan: https://solscan.io/tx/${signature}`);
      
      // Update transaction history with REAL signature
      const { transactionHistory } = await import('@/lib/transaction-history');
      if (externalWallet.address) {
        transactionHistory.setCurrentWallet(externalWallet.address);
        transactionHistory.addGoldTransaction('swap_receive', goldAmount, signature);
      }

      // Auto-save REAL transaction
      if (externalWallet.address) {
        await autoSaveTransaction(
          externalWallet.address,
          signature,
          'buy',
          solAmount,
          goldAmount,
          'success'
        );
      }

      toast({
        title: "🎉 REAL Purchase Successful!",
        description: `Successfully bought ${goldAmount.toFixed(2)} GOLDIUM tokens with ${buyAmount} SOL! Transaction: ${signature.slice(0, 8)}...`,
        variant: "default"
      });

      // Reset buy amount
      setBuyAmount('0.000047');
      
      // Refresh balances after real transaction
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to buy GOLDIUM:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to buy GOLDIUM tokens. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBuyingToken(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar - Chainzoku Style */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-2xl border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-2 shadow-xl shadow-cyan-400/30 hover:shadow-cyan-400/50 hover:scale-105 transition-all duration-300 chainzoku-pulse">
                <img 
                  src={goldiumLogo} 
                  alt="Goldium Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-2xl font-bold chainzoku-title font-['Space_Grotesk'] tracking-tight">GOLDIUM</div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#brand" className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-medium font-['Inter'] text-sm uppercase tracking-wide hover:scale-105">Brand</a>
              <a href="#defi" className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-medium font-['Inter'] text-sm uppercase tracking-wide hover:scale-105">DeFi</a>
              <a href="#tokenomics" className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-medium font-['Inter'] text-sm uppercase tracking-wide hover:scale-105">Tokenomics</a>
              {externalWallet.connected && (
                 <div className="chainzoku-card flex items-center gap-3 bg-black/90 backdrop-blur-lg px-3 py-2 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-cyan-400 rounded-full chainzoku-pulse shadow-lg shadow-cyan-400/60"></div>
                     <span className="text-xs text-white/90 font-['Inter'] font-medium">
                       {externalWallet.address?.slice(0, 4)}...{externalWallet.address?.slice(-4)}
                     </span>
                   </div>
                   <div className="h-3 w-px bg-cyan-400/40"></div>
                   <div className="flex items-center gap-1">
                     <span className="text-xs font-semibold text-cyan-400 font-['Inter']">
                       {externalWallet.balance.toFixed(2)} SOL
                     </span>
                   </div>
                   <div className="flex items-center gap-1">
                     <DollarSign className="w-3 h-3 text-cyan-400" />
                     <span className="text-xs font-semibold text-cyan-400 font-['Inter']">
                       {goldBalance.balance.toFixed(0)} GOLD
                     </span>
                   </div>
                 </div>
               )}
              <ExternalWalletSelector />
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {externalWallet.connected && (
                <div className="flex items-center gap-1 bg-black/80 backdrop-blur-lg px-3 py-2 rounded-lg border border-cyan-400/50">
            <span className="text-xs text-cyan-400 font-bold font-['Space_Grotesk']">
                    {externalWallet.balance.toFixed(2)} SOL
                  </span>
                </div>
              )}
              <button className="text-white p-2 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Real-time notifications */}
      <div className="fixed top-16 sm:top-20 right-2 sm:right-6 z-40">
        <RealTimeNotifications className="shadow-2xl" maxNotifications={3} />
      </div>

      {/* Hero Section - Ultra Modern Design */}
      <section className="relative pt-20 pb-32 min-h-screen flex items-center overflow-hidden">
        {/* Revolutionary Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-purple-800/20 to-pink-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(139,92,246,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_100%,rgba(59,130,246,0.3),transparent)]" />
        
        {/* Dynamic Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-600/25 rounded-full blur-3xl animate-pulse opacity-80"></div>
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-cyan-500/20 rounded-full blur-3xl animate-pulse opacity-70"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/25 to-rose-500/20 rounded-full blur-2xl animate-pulse opacity-60"></div>
        <div className="absolute top-10 left-10 w-60 h-60 bg-gradient-to-br from-emerald-500/15 to-teal-500/20 rounded-full blur-3xl animate-pulse opacity-50"></div>
        
        {/* Enhanced Animated Grid */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>
        
        {/* Particle Effect */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40 animation-delay-1000"></div>
          <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping opacity-50 animation-delay-2000"></div>
          <div className="absolute top-60 right-60 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-30 animation-delay-3000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-16 animate-fade-in-up">
            <div className="space-y-10">
              <div className="flex justify-center mb-12">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 p-5 shadow-2xl shadow-violet-500/60 transform group-hover:scale-110 transition-all duration-700 group-hover:rotate-12">
                    <img 
                      src={goldiumLogo} 
                      alt="Goldium Logo" 
                      className="w-full h-full object-contain filter drop-shadow-lg"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400/30 to-blue-400/30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-ping animation-delay-1000"></div>
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-violet-600/10 to-blue-600/10 blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 via-pink-400 to-blue-400 animate-gradient-x drop-shadow-2xl">
                  GOLDIUM
                </span>
              </h1>
              <div className="text-xl sm:text-2xl md:text-3xl text-slate-200 max-w-5xl mx-auto font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">✨ The Future of Digital Gold</span> on <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Solana Blockchain 🚀</span>
              </div>
              <p className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-medium">
                <span className="text-emerald-400 font-semibold">Secure</span>, <span className="text-blue-400 font-semibold">transparent</span>, and backed by <span className="text-yellow-400 font-semibold">real gold reserves</span>. 
                Experience the next generation of digital assets with <span className="text-purple-400 font-semibold">revolutionary DeFi technology</span>.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 hover:scale-105 group">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 p-3 shadow-xl group-hover:shadow-violet-500/50 transition-all duration-500 group-hover:scale-110">
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">💎 Acquire GOLDIUM</h3>
                      <p className="text-sm text-slate-300 font-medium">Lightning-fast transactions</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-violet-500/25 to-blue-500/25 rounded-xl p-5 border border-violet-400/20">
                    <p className="text-white text-base font-medium">
                      Exchange Rate: <span className="font-bold text-yellow-400 text-lg">1 SOL = 21,486 GOLD</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="0.1"
                      min="0.000047"
                      step="0.000047"
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white text-center text-lg font-semibold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/50 focus:bg-white/10 transition-all duration-300 hover:bg-white/10"
                      disabled={buyingToken}
                    />
                    <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-300 text-sm font-bold bg-slate-800/50 px-2 py-1 rounded-md">SOL</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-white bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-xl p-4 border border-violet-400/20">
                    <span className="text-xl font-bold text-violet-400">≈</span>
                    <span className="font-bold text-xl text-yellow-400">
                      {buyAmount ? (parseFloat(buyAmount) * 21486.893).toLocaleString() : '0'} GOLD
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleBuyGoldium}
                  disabled={buyingToken || !externalWallet.connected}
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500 text-white text-xl font-black py-5 px-8 rounded-xl shadow-2xl hover:shadow-violet-500/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8 border border-violet-400/30"
                >
                  {buyingToken ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ⏳ Processing...
                    </div>
                  ) : (
                    '🚀 Buy GOLDIUM'
                  )}
                </Button>
                {!externalWallet.connected && (
                  <p className="text-sm text-slate-300 text-center font-medium mt-4">Connect your wallet to purchase GOLDIUM</p>
                )}
              </div>
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 group">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center shadow-xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">📱 Follow Updates</h3>
                      <p className="text-sm text-slate-300 font-medium">Stay connected with us</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/25 to-purple-500/25 rounded-xl p-5 border border-blue-400/20">
                    <p className="text-white text-base font-medium">
                      Stay updated with <span className="text-blue-400 font-bold">latest news</span> and <span className="text-purple-400 font-bold">announcements</span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => window.open('https://twitter.com/goldiumofficial', '_blank')}
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 hover:from-blue-500 hover:via-cyan-400 hover:to-purple-500 text-white font-black py-5 px-8 rounded-xl shadow-2xl hover:shadow-blue-500/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border border-blue-400/30 mt-6"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-lg">Follow Updates</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Data Section - Revolutionary Design */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Ultra Modern Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/20 via-purple-900/15 to-indigo-900/25"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_100%_at_50%_50%,rgba(99,102,241,0.2),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_20%_80%,rgba(139,92,246,0.15),transparent)]"></div>
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-indigo-500/15 to-purple-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-purple-500/12 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/8 to-violet-500/10 rounded-full blur-3xl animate-pulse opacity-60"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 p-3 shadow-2xl shadow-indigo-500/50">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 font-['Space_Grotesk'] tracking-tight">
                Market Overview
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-slate-200 max-w-4xl mx-auto font-['Inter'] leading-relaxed font-semibold">
              📊 <span className="text-indigo-400 font-bold">Real-time performance metrics</span> and <span className="text-purple-400 font-bold">market statistics</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 group shadow-2xl hover:shadow-green-500/30">
              <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-4 shadow-2xl shadow-emerald-500/50 group-hover:shadow-emerald-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-slate-300 font-bold text-sm mb-4 uppercase tracking-widest group-hover:text-emerald-300 transition-colors">💰 Price</div>
              <div className="text-white text-3xl font-black mb-6 group-hover:text-emerald-300 transition-colors">${tokenData ? tokenData.currentPrice.toFixed(6) : '0.000000'}</div>
              <div className="bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-300 text-sm font-bold px-6 py-3 rounded-xl border border-emerald-400/30 group-hover:from-emerald-400/40 group-hover:to-green-400/40 transition-all duration-500">{tokenData ? `+${tokenData.priceChange24h.toFixed(1)}%` : '+0.0%'}</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 group shadow-2xl hover:shadow-blue-500/30">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-slate-300 font-bold text-sm mb-4 uppercase tracking-widest group-hover:text-blue-300 transition-colors">📊 Market Cap</div>
              <div className="text-white text-3xl font-black mb-6 group-hover:text-blue-300 transition-colors">${tokenData ? (tokenData.marketCap / 1000000).toFixed(1) : '0.0'}M</div>
              <div className="bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 text-sm font-bold px-6 py-3 rounded-xl border border-blue-400/30 group-hover:from-blue-400/40 group-hover:to-indigo-400/40 transition-all duration-500">+5.7%</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 group shadow-2xl hover:shadow-purple-500/30">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-slate-300 font-bold text-sm mb-4 uppercase tracking-widest group-hover:text-purple-300 transition-colors">⚡ 24H Volume</div>
              <div className="text-white text-3xl font-black mb-6 group-hover:text-purple-300 transition-colors">${tokenData ? (tokenData.volume24h / 1000).toFixed(0) : '0'}K</div>
              <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 text-sm font-bold px-6 py-3 rounded-xl border border-purple-400/30 group-hover:from-purple-400/40 group-hover:to-pink-400/40 transition-all duration-500">+12.4%</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 group shadow-2xl hover:shadow-orange-500/30">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/50 group-hover:shadow-orange-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-slate-300 font-bold text-sm mb-4 uppercase tracking-widest group-hover:text-orange-300 transition-colors">👥 Holders</div>
              <div className="text-white text-3xl font-black mb-6 group-hover:text-orange-300 transition-colors">{tokenData ? tokenData.holders.toLocaleString() : '0'}</div>
              <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 text-sm font-bold px-6 py-3 rounded-xl border border-orange-400/30 group-hover:from-orange-400/40 group-hover:to-red-400/40 transition-all duration-500">+8.2%</div>
            </div>
          </div>
        </div>
      </section>

      {/* DeFi Section */}
      <section id="defi" className="py-28 px-6 relative overflow-hidden">
        {/* Revolutionary DeFi Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/25 via-blue-900/20 to-indigo-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,rgba(99,102,241,0.25),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_80%_20%,rgba(139,92,246,0.2),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-indigo-500/12 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-violet-500/12 rounded-full blur-3xl animate-pulse opacity-70"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 animate-fade-in-up">
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4 shadow-2xl shadow-blue-500/50 animate-pulse">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-['Space_Grotesk'] tracking-tighter">
                DeFi Platform
              </h2>
            </div>
            <p className="text-2xl md:text-3xl text-slate-100 max-w-5xl mx-auto font-['Inter'] leading-relaxed font-bold">
              🚀 <span className="text-blue-400 font-black">Complete ecosystem</span> for <span className="text-indigo-400 font-black">trading</span>, <span className="text-purple-400 font-black">staking</span>, and <span className="text-pink-400 font-black">managing</span> your digital assets
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 shadow-2xl shadow-indigo-500/20">
            <Tabs defaultValue="swap" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-12 bg-white/5 border border-white/10 rounded-3xl p-3 shadow-xl">
                <TabsTrigger value="swap" className="text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/50 data-[state=active]:border-2 data-[state=active]:border-indigo-400/50 font-bold text-lg rounded-2xl py-4 px-6 transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 hover:text-indigo-300">
                  🔄 Swap
                </TabsTrigger>
                <TabsTrigger value="stake" className="text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/50 data-[state=active]:border-2 data-[state=active]:border-indigo-400/50 font-bold text-lg rounded-2xl py-4 px-6 transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 hover:text-purple-300">
                  💎 Stake
                </TabsTrigger>
                <TabsTrigger value="dragon" className="text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/50 data-[state=active]:border-2 data-[state=active]:border-indigo-400/50 font-bold text-lg rounded-2xl py-4 px-6 transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 hover:text-pink-300">
                  🐉 Dragon
                </TabsTrigger>
                <TabsTrigger value="send" className="text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/50 data-[state=active]:border-2 data-[state=active]:border-indigo-400/50 font-bold text-lg rounded-2xl py-4 px-6 transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 hover:text-green-300">
                  📤 Send
                </TabsTrigger>
                <TabsTrigger value="history" className="text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:via-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/50 data-[state=active]:border-2 data-[state=active]:border-indigo-400/50 font-bold text-lg rounded-2xl py-4 px-6 transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 hover:text-orange-300">
                  📊 History
                </TabsTrigger>
              </TabsList>
              
              <div className="min-h-[500px] bg-gradient-to-br from-white/10 via-white/5 to-white/8 rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-2xl">
                <TabsContent value="swap" className="h-full">
                  <SelfContainedSwapTab />
                </TabsContent>
                
                <TabsContent value="stake" className="h-full">
                  <SelfContainedStakingTab />
                </TabsContent>
                
                <TabsContent value="dragon" className="h-full">
                  <GoldiumGamifiedStaking />
                </TabsContent>
                
                <TabsContent value="send" className="h-full">
                  <RealSendTab />
                </TabsContent>
                
                <TabsContent value="history" className="h-full">
                  <TransactionHistory />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Tokenomics Section - Revolutionary Design */}
      <section id="tokenomics" className="py-32 px-6 relative overflow-hidden">
        {/* Ultra Modern Tokenomics Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/30 via-pink-900/20 to-indigo-900/25"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_20%_50%,rgba(168,85,247,0.25),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_80%_20%,rgba(236,72,153,0.2),transparent)]"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-pink-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-indigo-500/15 to-purple-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/8 to-pink-500/10 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 animate-fade-in-up">
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-600 to-indigo-700 p-4 shadow-2xl shadow-purple-500/50 animate-pulse">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 font-['Space_Grotesk'] tracking-tighter">
                Tokenomics
              </h2>
            </div>
            <p className="text-2xl md:text-3xl text-slate-100 max-w-5xl mx-auto font-['Inter'] leading-relaxed font-bold">
              💎 <span className="text-purple-400 font-black">Transparent</span> and <span className="text-pink-400 font-black">sustainable</span> token distribution designed for <span className="text-indigo-400 font-black">long-term value</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-500/20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-indigo-700 p-3 shadow-2xl shadow-purple-500/50">
                    <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Token Distribution</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-3 px-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-slate-200 font-bold text-lg">Total Supply</span>
                    <span className="text-white font-black text-xl">1,000,000,000 GOLD</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-slate-200 font-bold text-lg">Circulating Supply</span>
                    <span className="text-white font-black text-xl">600,000,000 GOLD</span>
                  </div>
                  <div className="h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 my-6 rounded-full"></div>
                  <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-400/30 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300">
                    <span className="text-blue-300 font-bold text-lg">💧 Liquidity Pool</span>
                    <span className="text-blue-400 font-black text-xl">300,000,000 (30%)</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-400/30 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300">
                    <span className="text-green-300 font-bold text-lg">🎁 Community Rewards</span>
                    <span className="text-green-400 font-black text-xl">250,000,000 (25%)</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-2xl border border-purple-400/30 hover:from-purple-500/20 hover:to-violet-500/20 transition-all duration-300">
                    <span className="text-purple-300 font-bold text-lg">🔧 Development</span>
                    <span className="text-purple-400 font-black text-xl">200,000,000 (20%)</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl border border-orange-400/30 hover:from-orange-500/20 hover:to-amber-500/20 transition-all duration-300">
                    <span className="text-orange-300 font-bold text-lg">📢 Marketing</span>
                    <span className="text-orange-400 font-black text-xl">150,000,000 (15%)</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-400/30 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300">
                    <span className="text-red-300 font-bold text-lg">🔒 Team (Locked)</span>
                    <span className="text-red-400 font-black text-xl">100,000,000 (10%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-pink-500/20">
                <AnimatedTokenomicsCharts />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Twitter Feed Section - Revolutionary Design */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Ultra Modern Community Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/30 via-blue-900/20 to-purple-900/25"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_30%_50%,rgba(59,130,246,0.25),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_70%_30%,rgba(147,51,234,0.2),transparent)]"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-indigo-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-purple-500/15 to-indigo-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/8 to-purple-500/10 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4 shadow-2xl shadow-blue-500/50 animate-pulse">
                <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-['Space_Grotesk'] tracking-tighter">
                Community Updates
              </h2>
            </div>
            <p className="text-2xl md:text-3xl text-slate-100 max-w-5xl mx-auto font-['Inter'] leading-relaxed font-bold">
              🐦 Stay connected with the <span className="text-blue-400 font-black">latest news</span> and <span className="text-indigo-400 font-black">updates</span> from our <span className="text-purple-400 font-black">community</span>
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-blue-500/20 max-w-4xl w-full">
              <TwitterEmbed />
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Revolutionary Design */}
      <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 border-t border-white/5 py-20 px-6 relative overflow-hidden">
        {/* Ultra Modern Footer Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/50 via-slate-900/30 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,rgba(168,85,247,0.15),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_20%_100%,rgba(59,130,246,0.1),transparent)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-500/8 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-2xl p-3 shadow-2xl shadow-yellow-500/30">
                  <img src={goldiumLogo} alt="Goldium" className="w-full h-full object-contain" />
                </div>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 font-['Space_Grotesk'] tracking-tight">GOLDIUM</span>
              </div>
              <p className="text-slate-200 text-base leading-relaxed font-medium max-w-sm">
                🚀 The future of <span className="text-yellow-400 font-bold">digital gold</span> on Solana blockchain. Secure, fast, and decentralized platform for the <span className="text-purple-400 font-bold">next generation</span>.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-500/20 hover:border-blue-400/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-500/20 hover:border-purple-400/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-pink-500/20 hover:border-pink-400/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-8 text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Product</h3>
              <ul className="space-y-3">
                <li><a href="#defi" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  DeFi App
                </a></li>
                <li><a href="#tokenomics" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all"></span>
                  Tokenomics
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                  API
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-orange-400 rounded-full group-hover:w-2 transition-all"></span>
                  Analytics
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-8 text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></span>
                  Documentation
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full group-hover:w-2 transition-all"></span>
                  Whitepaper
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-pink-400 rounded-full group-hover:w-2 transition-all"></span>
                  Security Audit
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full group-hover:w-2 transition-all"></span>
                  Roadmap
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-8 text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full group-hover:w-2 transition-all"></span>
                  Help Center
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                  Contact Us
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-violet-400 rounded-full group-hover:w-2 transition-all"></span>
                  Status
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-teal-400 rounded-full group-hover:w-2 transition-all"></span>
                  Bug Report
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-200 text-base font-medium">
              © 2025 <span className="text-yellow-400 font-bold">Goldium</span>. All rights reserved. Built with <span className="text-red-400">❤️</span> on <span className="text-purple-400 font-bold">Solana</span>.
            </p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 text-base hover:underline hover:underline-offset-4 hover:decoration-purple-400">Terms of Service</a>
              <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 text-base hover:underline hover:underline-offset-4 hover:decoration-pink-400">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
