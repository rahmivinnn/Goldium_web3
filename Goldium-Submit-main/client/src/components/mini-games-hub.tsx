import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gamepad2, 
  Zap, 
  Brain, 
  Pickaxe, 
  Trophy, 
  Shield,
  Timer,
  Coins,
  Users,
  Star
} from 'lucide-react';
import { AuthenticShardChase } from './authentic-shard-chase';
import { SolFlipMemoryGame } from './solflip-memory-game';
import { CryptoGuessGame } from './games/crypto-guess';
import { NumberMemoryGame } from './games/number-memory';
import { TokenMatchGame } from './games/token-match';

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  icon: React.ReactNode;
  status: 'live' | 'coming-soon' | 'beta';
  players: number;
  rewards: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const games: Game[] = [
  {
    id: 'shard-chase',
    title: 'Solana Shard Chase',
    genre: 'Real-Time Item Hunt',
    description: 'Authentic Unity-style space mining game. Navigate your ship, collect crystal shards, compete with AI miners!',
    icon: <Zap className="w-6 h-6" />,
    status: 'live',
    players: 1247,
    rewards: 'GOLD Tokens',
    difficulty: 'Easy'
  },
  {
    id: 'solflip',
    title: 'SolFlip: Memory Battle',
    genre: 'Memory Puzzle + Wagering',
    description: 'Match cards against time in wagering battles. Winner takes the GOLD pool!',
    icon: <Brain className="w-6 h-6" />,
    status: 'live',
    players: 456,
    rewards: 'GOLD Pool + NFT Boosters',
    difficulty: 'Medium'
  },
  {
    id: 'gold-mine',
    title: 'GOLD Mine Escape',
    genre: 'Reaction + Trap Avoidance',
    description: 'Navigate dangerous underground mines, collect gold, and escape to the surface alive!',
    icon: <Pickaxe className="w-6 h-6" />,
    status: 'beta',
    players: 89,
    rewards: 'GOLD Tokens + Leaderboard NFT',
    difficulty: 'Hard'
  },
  {
    id: 'crypto-guess',
    title: 'Crypto Price Guess',
    genre: 'Price Prediction Game',
    description: 'Guess cryptocurrency prices and test your market knowledge. Score points for accuracy!',
    icon: <Trophy className="w-6 h-6" />,
    status: 'live',
    players: 324,
    rewards: 'GOLD Tokens + Accuracy NFTs',
    difficulty: 'Medium'
  },
  {
    id: 'number-memory',
    title: 'Number Memory Test',
    genre: 'Memory Challenge',
    description: 'Memorize increasingly long number sequences. How many digits can you remember?',
    icon: <Brain className="w-6 h-6" />,
    status: 'live',
    players: 567,
    rewards: 'Brain Booster NFTs',
    difficulty: 'Easy'
  },
  {
    id: 'token-match',
    title: 'Token Memory Match',
    genre: 'Memory Puzzle',
    description: 'Match pairs of crypto tokens in this classic memory game with a Web3 twist!',
    icon: <Coins className="w-6 h-6" />,
    status: 'live',
    players: 445,
    rewards: 'Memory Master NFTs',
    difficulty: 'Easy'
  },
  {
    id: 'defi-dodger',
    title: 'DeFi Dodger',
    genre: 'Reflex / Dodge Game',
    description: 'Dodge scam tokens, rugpulls, and market crashes. Survive the crypto chaos!',
    icon: <Shield className="w-6 h-6" />,
    status: 'beta',
    players: 156,
    rewards: 'Power-up NFTs + GOLD',
    difficulty: 'Medium'
  }
];

export function MiniGamesHub() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'beta': return 'bg-yellow-500';
      case 'coming-soon': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      case 'Hard': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  if (selectedGame === 'shard-chase') {
    return (
      <div className="space-y-6">
        <Button 
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Games Hub
        </Button>
        <AuthenticShardChase />
      </div>
    );
  }

  if (selectedGame === 'crypto-guess') {
    return (
      <div className="space-y-6">
        <Button 
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Games Hub
        </Button>
        <CryptoGuessGame />
      </div>
    );
  }

  if (selectedGame === 'number-memory') {
    return (
      <div className="space-y-6">
        <Button 
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Games Hub
        </Button>
        <NumberMemoryGame />
      </div>
    );
  }

  if (selectedGame === 'token-match') {
    return (
      <div className="space-y-6">
        <Button 
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Games Hub
        </Button>
        <TokenMatchGame />
      </div>
    );
  }

  if (selectedGame === 'solflip') {
    return (
      <div className="space-y-6">
        <Button 
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Games Hub
        </Button>
        <SolFlipMemoryGame />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Solana Mini Games
          </h2>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Play interactive blockchain games and earn GOLD tokens. Connect your wallet and start gaming on Solana!
        </p>
      </div>

      <Tabs defaultValue="all-games" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
          <TabsTrigger value="all-games">All Games</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
          <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="all-games" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Card key={game.id} className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        {game.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <p className="text-sm text-gray-400">{game.genre}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(game.status)} text-white`}>
                      {game.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{game.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Players Online:</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">{game.players.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Difficulty:</span>
                      <Badge variant="outline" className={getDifficultyColor(game.difficulty)}>
                        {game.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Rewards:</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-xs">{game.rewards}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={() => {
                      if (game.status === 'live') {
                        setSelectedGame(game.id);
                      }
                    }}
                    disabled={game.status !== 'live'}
                  >
                    {game.status === 'live' ? 'Play Now' : 
                     game.status === 'beta' ? 'Join Beta' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.filter(game => game.status === 'live').map((game) => (
              <Card key={game.id} className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      {game.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <p className="text-sm text-gray-400">{game.genre}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{game.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500"
                    onClick={() => setSelectedGame(game.id)}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="beta" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.filter(game => game.status === 'beta').map((game) => (
              <Card key={game.id} className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      {game.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <p className="text-sm text-gray-400">{game.genre}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{game.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    disabled
                  >
                    Join Beta Waitlist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coming-soon" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.filter(game => game.status === 'coming-soon').map((game) => (
              <Card key={game.id} className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border-gray-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-500/20 rounded-lg">
                      {game.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <p className="text-sm text-gray-400">{game.genre}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{game.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-gray-500 to-slate-500"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Gaming Stats */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Gaming Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">1,492</div>
              <div className="text-sm text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">847K</div>
              <div className="text-sm text-gray-400">GOLD Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">23,156</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">5</div>
              <div className="text-sm text-gray-400">Games Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}