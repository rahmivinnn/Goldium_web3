import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Info, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'wouter';

// Import existing components
import { SelfContainedSwapTab } from '@/components/self-contained-swap-tab';
import { SelfContainedStakingTab } from '@/components/self-contained-staking-tab';
import { RealSendTab } from '@/components/real-send-tab';
import { TransactionHistory } from '@/components/transaction-history';
import { BalanceCards } from '@/components/balance-cards';
import { ExternalWalletSelector } from '@/components/external-wallet-selector';
import { BalanceStatusIndicator } from '@/components/balance-status-indicator';
import { useSolanaWallet } from '@/components/solana-wallet-provider';
import { AnimatedTokenomicsCharts } from '@/components/animated-tokenomics-charts';

export default function Home() {
  const wallet = useSolanaWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation - Fixed at top like eeeeecoin.com */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Goldium</span>
                <p className="text-xs text-gray-400">DeFi Exchange</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-white hover:text-yellow-400 transition-colors font-medium">Home</a>
        <a href="#defi" className="text-gray-300 hover:text-yellow-400 transition-colors">DeFi</a>
        <a href="#analytics" className="text-gray-300 hover:text-yellow-400 transition-colors">Analytics</a>
        <a href="#about" className="text-gray-300 hover:text-yellow-400 transition-colors">About</a>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <BalanceStatusIndicator 
                  connected={wallet.connected}
                  balance={wallet.balance}
                  walletType={wallet.selectedWallet || undefined}
                />
              </div>
              <ExternalWalletSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Like eeeeecoin.com */}
      <section id="home" className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                GOLDIUM
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The Ultimate Solana DeFi Experience. Swap, Stake, and Earn with GOLD tokens.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={() => document.getElementById('defi')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Trading
              </button>
              <button 
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
              >
                Learn More
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mx-auto mb-4">
          <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fast Swaps</h3>
                <p className="text-gray-400">Lightning-fast token swaps on Solana</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mx-auto mb-4">
          <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Secure Staking</h3>
                <p className="text-gray-400">Earn rewards by staking your GOLD</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Low Fees</h3>
                <p className="text-gray-400">Minimal transaction costs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Balance Cards Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BalanceCards />
        </div>
      </section>

      {/* Analytics Section - Real-time Tokenomics */}
      <section id="analytics" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Real-time Analytics</h2>
            <p className="text-xl text-gray-300">Live tokenomics data and market insights for GOLD token</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <AnimatedTokenomicsCharts />
          </div>
        </div>
      </section>

      {/* DeFi Section - Main functionality */}
      <section id="defi" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">DeFi Operations</h2>
            <p className="text-xl text-gray-300">Swap, stake, send, and track your transactions</p>
          </div>

          {/* Main DeFi Interface */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <Tabs defaultValue="swap" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-white/10 rounded-lg p-1">
                <TabsTrigger 
                  value="swap" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-gray-300"
                >
                  Swap
                </TabsTrigger>
                <TabsTrigger 
                  value="stake" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  Stake
                </TabsTrigger>
                <TabsTrigger 
                  value="send" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  Send
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  History
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="swap">
                  <SelfContainedSwapTab />
                </TabsContent>
                
                <TabsContent value="stake">
                  <SelfContainedStakingTab />
                </TabsContent>
                
                <TabsContent value="send">
                  <RealSendTab />
                </TabsContent>
                
                <TabsContent value="history">
                  <TransactionHistory />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">About Goldium</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Goldium is a cutting-edge DeFi platform built on Solana, offering seamless token swaps, 
              staking rewards, and comprehensive transaction management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">Why Choose Goldium?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Built on Solana for lightning-fast transactions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Auto-save transaction history to localStorage</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Secure wallet integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Comprehensive DeFi operations</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">Features</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>SOL ↔ GOLD token swaps</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>GOLD token staking with rewards</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Token sending capabilities</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Transaction history with Solscan links</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-xl font-bold text-white">Goldium</span>
            </div>
            <p className="text-gray-400 mb-4">The Ultimate Solana DeFi Experience</p>
            <p className="text-sm text-gray-500">Built with ❤️ for the Solana ecosystem</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
