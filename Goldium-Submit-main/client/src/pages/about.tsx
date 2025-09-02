import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Calendar, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import goldiumLogo from '@assets/k1xiYLna_400x400-removebg-preview_1754140723127.png';

export function About() {
  return (
    <div className="min-h-screen bg-galaxy-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="text-galaxy-accent hover:text-galaxy-bright hover:bg-galaxy-purple/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to DeFi Platform
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-galaxy-bright mb-4">
            About <span className="text-gold-primary">GOLDIUM</span>
          </h1>
          <p className="text-xl text-galaxy-accent max-w-2xl mx-auto">
            Web3 Gaming & DeFi Platform on Solana Ecosystem
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Profile Card */}
          <Card className="bg-galaxy-card border-galaxy-purple/30 overflow-hidden">
            <div className="relative">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-gold-primary via-orange-500 to-yellow-400"></div>
              
              {/* Profile Content */}
              <CardContent className="relative p-8">
                {/* Profile Picture */}
                <div className="absolute -top-16 left-8">
                  <div className="w-32 h-32 rounded-full border-4 border-galaxy-dark bg-galaxy-darker overflow-hidden">
                    <img 
                      src={goldiumLogo} 
                      alt="Goldium Logo" 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                </div>

                {/* Follow Button */}
                <div className="flex justify-end mb-8">
                  <Button 
                    className="bg-galaxy-bright text-galaxy-dark hover:bg-galaxy-accent"
                    onClick={() => window.open('https://t.me/goldiumofficial', '_blank')}
                  >
                    Follow
                  </Button>
                </div>

                {/* Profile Info */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-3xl font-bold text-galaxy-bright">GOLDIUM</h2>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs">✓</span>
                    </div>
                  </div>

                  <p className="text-galaxy-accent">@goldiumofficial</p>

                  <p className="text-galaxy-bright text-lg">
                    Web3 Gaming & DeFi Platform | 
                    <a 
                      href="https://t.me/goldiumofficial" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 ml-1"
                    >
                      t.me/goldiumofficial
                    </a>
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-galaxy-accent">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>Solana Ecosystem</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ExternalLink className="w-4 h-4" />
                      <a 
                        href="https://goldium.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        goldium.io
                      </a>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined March 2025</span>
                    </div>
                  </div>

                  {/* Followers */}
                  <div className="flex space-x-6 pt-4">
                    <div>
                      <span className="text-xl font-bold text-galaxy-bright">28</span>
                      <span className="text-galaxy-accent ml-1">Following</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-galaxy-bright">78</span>
                      <span className="text-galaxy-accent ml-1">Followers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <Button 
              className="bg-gradient-to-r from-gold-primary to-yellow-500 hover:from-yellow-500 hover:to-gold-primary text-black font-semibold px-8 py-3"
              onClick={() => window.open('https://goldium.io', '_blank')}
            >
              Visit Our DApp
            </Button>
            <Button 
              variant="outline" 
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white px-8 py-3"
              onClick={() => window.open('https://t.me/goldiumofficial', '_blank')}
            >
              Join Telegram
            </Button>
          </div>

          {/* Platform Features */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-gold-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-galaxy-bright mb-3">DeFi Platform</h3>
                <ul className="space-y-2 text-galaxy-accent">
                  <li>• SOL ⟷ GOLD Token Swapping</li>
                  <li>• 5% APY Staking Rewards</li>
                  <li>• Multi-Wallet Support</li>
                  <li>• Solscan Transaction Tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-galaxy-bright mb-3">Web3 Gaming</h3>
                <ul className="space-y-2 text-galaxy-accent">
                  <li>• Play-to-Earn Mechanics</li>
                  <li>• NFT Integration</li>
                  <li>• Gaming Tournaments</li>
                  <li>• Community Rewards</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Community Links */}
          <Card className="bg-galaxy-card border-galaxy-purple/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-galaxy-bright mb-4">Join Our Community</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
                  onClick={() => window.open('https://t.me/goldiumofficial', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
                <Button 
                  variant="outline" 
                  className="border-galaxy-purple/50 text-galaxy-accent hover:bg-galaxy-purple/20"
                  onClick={() => window.open('https://twitter.com/goldiumofficial', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="border-galaxy-purple/50 text-galaxy-accent hover:bg-galaxy-purple/20"
                  onClick={() => window.open('https://discord.gg/goldium', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Discord
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gold-primary/50 text-gold-primary hover:bg-gold-primary hover:text-black"
                  onClick={() => window.open('https://goldium.io', '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}