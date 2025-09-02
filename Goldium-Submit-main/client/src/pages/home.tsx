import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BalanceCards } from '@/components/balance-cards';
import { SelfContainedSwapTab } from '@/components/self-contained-swap-tab';
import { SelfContainedStakingTab } from '@/components/self-contained-staking-tab';
import { RealSendTab } from '@/components/real-send-tab';
import { TransactionHistory } from '@/components/transaction-history';
import { ExternalWalletSelector } from '@/components/external-wallet-selector';
import { BalanceStatusIndicator } from '@/components/balance-status-indicator';
import { useSolanaWallet } from '@/components/solana-wallet-provider';


export default function Home() {
  const wallet = useSolanaWallet();

  // Self-contained wallet is always connected, no need for wallet selection

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
          </div>
        </div>
      </section>

      {/* Balance Cards Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <p>Balance Cards will be here</p>
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
