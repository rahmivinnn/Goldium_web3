import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Timer, Trophy, Coins, Zap } from 'lucide-react';

interface GameCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  icon: string;
  color: string;
}

const CARD_PAIRS = [
  { value: 'SOL', icon: 'coin-sol', color: '#9945FF' },
  { value: 'GOLD', icon: 'crystal-gold', color: '#FFD700' },
  { value: 'DeFi', icon: 'bank-vault', color: '#00D4AA' },
  { value: 'Swap', icon: 'arrow-cycle', color: '#FF6B6B' },
  { value: 'Phantom', icon: 'ghost-wallet', color: '#AB9FF2' },
  { value: 'Solana', icon: 'rocket-ship', color: '#14F195' },
  { value: 'Token', icon: 'crypto-chip', color: '#F7931A' },
  { value: 'Stake', icon: 'lock-secure', color: '#4ECDC4' }
];

export function SolFlipMemoryGame() {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  // Initialize game
  const initializeGame = () => {
    const shuffledCards: GameCard[] = [];
    let id = 0;
    
    CARD_PAIRS.forEach(pair => {
      // Add two cards for each pair
      shuffledCards.push({
        id: id++,
        value: pair.value,
        icon: pair.icon,
        color: pair.color,
        isFlipped: false,
        isMatched: false
      });
      shuffledCards.push({
        id: id++,
        value: pair.value,
        icon: pair.icon,
        color: pair.color,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setTimeLeft(60);
    setScore(0);
    setMoves(0);
    setGameState('playing');
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('lost');
    }
  }, [gameState, timeLeft]);

  // Check for win condition
  useEffect(() => {
    if (matchedPairs === CARD_PAIRS.length && gameState === 'playing') {
      const timeBonus = timeLeft * 10;
      const moveBonus = Math.max(0, 100 - moves * 2);
      setScore(timeBonus + moveBonus + 500);
      setGameState('won');
    }
  }, [matchedPairs, gameState, timeLeft, moves]);

  // Handle card flip
  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const getCardClass = (card: GameCard) => {
    let baseClass = "aspect-square rounded-xl cursor-pointer transition-all duration-500 flex flex-col items-center justify-center text-lg font-bold border-2 relative overflow-hidden transform ";
    
    if (card.isMatched) {
      baseClass += "bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 border-emerald-400 text-emerald-300 scale-105 shadow-lg shadow-emerald-500/20 ";
    } else if (card.isFlipped) {
      baseClass += `bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 text-white shadow-xl transform scale-105 `;
    } else {
      baseClass += "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/50 text-slate-500 hover:border-slate-500 hover:scale-102 hover:shadow-md ";
    }
    
    return baseClass;
  };

  const renderCardIcon = (card: GameCard) => {
    const iconSize = "w-8 h-8";
    
    // Create authentic Unity-style pixel icons using CSS
    const iconStyle = {
      background: card.isFlipped || card.isMatched ? card.color : 'transparent',
      WebkitMask: `url("data:image/svg+xml,${encodeURIComponent(getIconSVG(card.icon))}")`,
      mask: `url("data:image/svg+xml,${encodeURIComponent(getIconSVG(card.icon))}")`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain'
    };
    
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`${iconSize} transition-all duration-300`} style={iconStyle} />
        {(card.isFlipped || card.isMatched) && (
          <div 
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: card.color }}
          >
            {card.value}
          </div>
        )}
      </div>
    );
  };

  const getIconSVG = (iconType: string) => {
    const icons: Record<string, string> = {
      'coin-sol': '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 8h8l-2 2H6l2-2z"/><path d="M16 16H8l2-2h8l-2 2z"/></svg>',
      'crystal-gold': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6h6l-3 6 3 6h-6l-3 6-3-6H3l3-6-3-6h6l3-6z"/></svg>',
      'bank-vault': '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1"/></svg>',
      'arrow-cycle': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4A5.5 5.5 0 0 0 2 9.5c0 .5.5 1 1 1s1-.5 1-1A3.5 3.5 0 0 1 7.5 6H9l-1.5 1.5L9 9h3V6l-1.5 1.5L12 6h4.5A3.5 3.5 0 0 1 20 9.5c0 .5.5 1 1 1s1-.5 1-1A5.5 5.5 0 0 0 16.5 4H12l1.5 1.5L12 7H9l1.5-1.5L9 4H7.5z"/></svg>',
      'ghost-wallet': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 5 5 5 9v11l3-3 2 2 2-2 2 2 3-3V9c0-4-3-7-7-7zm-2 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>',
      'rocket-ship': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.5 4 9 11 9 11s-4-1-9-1-9 1-9 1 3.5-7 9-11zm0 11.5A1.5 1.5 0 1 0 12 16a1.5 1.5 0 0 0 0-2.5z"/><path d="M7 18s0 1.5 5 1.5S17 18 17 18"/></svg>',
      'crypto-chip': '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M19 9h3M2 15h3M19 15h3"/></svg>',
      'lock-secure': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C9.8 1 8 2.8 8 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-2V5c0-2.2-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2v2h-4V5c0-1.1.9-2 2-2zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>'
    };
    
    return icons[iconType] || icons['coin-sol'];
  };

  return (
    <Card className="w-full max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Brain className="w-6 h-6 text-cyan-400" />
          SolFlip: Unity Memory Battle
        </CardTitle>
        <p className="text-sm text-slate-400">Match pairs of authentic Solana ecosystem icons before time runs out!</p>
      </CardHeader>
      <CardContent>
        {gameState === 'waiting' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🧠</div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Ready to Test Your Memory?</h3>
              <p className="text-gray-400 mb-6">Match all 8 pairs of Solana DeFi cards within 60 seconds!</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
                <div className="bg-purple-900/20 p-4 rounded-lg">
                  <Timer className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="font-semibold">60 Seconds</div>
                  <div className="text-sm text-gray-400">Time Limit</div>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg">
                  <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="font-semibold">16 Cards</div>
                  <div className="text-sm text-gray-400">8 Pairs to Match</div>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="font-semibold">GOLD Reward</div>
                  <div className="text-sm text-gray-400">Win Tokens</div>
                </div>
              </div>
              <Button 
                onClick={initializeGame}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 text-lg"
              >
                Start Game
              </Button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-red-900/20 border-red-500/30">
                <CardContent className="p-4 text-center">
                  <Timer className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-400">{timeLeft}s</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{moves}</div>
                  <div className="text-xs text-gray-400">Moves</div>
                </CardContent>
              </Card>
              <Card className="bg-green-900/20 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">{matchedPairs}/8</div>
                  <div className="text-xs text-gray-400">Pairs</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-900/20 border-yellow-500/30">
                <CardContent className="p-4 text-center">
                  <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{matchedPairs}/8 pairs</span>
              </div>
              <Progress value={(matchedPairs / 8) * 100} className="w-full" />
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={getCardClass(card)}
                  onClick={() => handleCardClick(card.id)}
                >
                  {card.isFlipped || card.isMatched ? (
                    renderCardIcon(card)
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg mb-2 flex items-center justify-center">
                        <div className="w-4 h-4 bg-slate-500 rounded" />
                      </div>
                      <div className="text-xs font-mono text-slate-500">???</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'won' || gameState === 'lost') && (
          <div className="text-center space-y-6">
            <div className="text-6xl">
              {gameState === 'won' ? '🏆' : '😅'}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">
                {gameState === 'won' ? 'Congratulations!' : 'Time\'s Up!'}
              </h3>
              <p className="text-gray-400 mb-6">
                {gameState === 'won' 
                  ? `You matched all pairs in ${moves} moves with ${timeLeft}s remaining!`
                  : 'Better luck next time! Keep practicing your memory skills.'
                }
              </p>
              
              {gameState === 'won' && (
                <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                  <div className="bg-green-900/20 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-400">{score}</div>
                    <div className="text-xs text-gray-400">Final Score</div>
                  </div>
                  <div className="bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">{moves}</div>
                    <div className="text-xs text-gray-400">Total Moves</div>
                  </div>
                  <div className="bg-yellow-900/20 p-3 rounded-lg">
                    <div className="text-lg font-bold text-yellow-400">{timeLeft}s</div>
                    <div className="text-xs text-gray-400">Time Bonus</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={initializeGame}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  Play Again
                </Button>
                {gameState === 'won' && (
                  <Button 
                    variant="outline"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Claim GOLD Reward
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}