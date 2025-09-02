import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CRYPTO_PRICES = [
  { name: 'Bitcoin', symbol: 'BTC', basePrice: 65000 },
  { name: 'Ethereum', symbol: 'ETH', basePrice: 3200 },
  { name: 'Solana', symbol: 'SOL', basePrice: 195 },
  { name: 'Cardano', symbol: 'ADA', basePrice: 0.45 },
  { name: 'Dogecoin', symbol: 'DOGE', basePrice: 0.08 }
];

export function CryptoGuessGame() {
  const [currentCrypto, setCurrentCrypto] = useState(CRYPTO_PRICES[0]);
  const [actualPrice, setActualPrice] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameResult, setGameResult] = useState<'correct' | 'close' | 'wrong' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const generatePrice = () => {
    // Add realistic price variation (±10%)
    const variation = (Math.random() - 0.5) * 0.2; // -10% to +10%
    return Math.round(currentCrypto.basePrice * (1 + variation) * 100) / 100;
  };

  const startNewRound = () => {
    const randomCrypto = CRYPTO_PRICES[Math.floor(Math.random() * CRYPTO_PRICES.length)];
    setCurrentCrypto(randomCrypto);
    setActualPrice(generatePrice());
    setGuess('');
    setGameResult(null);
    setIsPlaying(true);
  };

  const checkGuess = () => {
    const guessNum = parseFloat(guess);
    const difference = Math.abs(guessNum - actualPrice);
    const percentDiff = (difference / actualPrice) * 100;

    if (percentDiff <= 2) {
      setGameResult('correct');
      setScore(score + 10);
    } else if (percentDiff <= 10) {
      setGameResult('close');
      setScore(score + 5);
    } else {
      setGameResult('wrong');
    }

    setTimeout(() => {
      if (round < 5) {
        setRound(round + 1);
        startNewRound();
      } else {
        setIsPlaying(false);
      }
    }, 2000);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-xl text-center">Crypto Price Guess</CardTitle>
        <div className="flex justify-between text-sm">
          <span>Round: {round}/5</span>
          <span>Score: {score}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPlaying ? (
          <>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-400">{currentCrypto.symbol}</h3>
              <p className="text-gray-300">{currentCrypto.name}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Guess the current price (USD):</label>
              <Input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess..."
                className="bg-slate-800 border-gray-600"
              />
            </div>

            <Button 
              onClick={checkGuess}
              disabled={!guess || gameResult !== null}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Submit Guess
            </Button>

            {gameResult && (
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">
                  Actual Price: <span className="text-yellow-400">${actualPrice}</span>
                </p>
                <Badge variant={gameResult === 'correct' ? 'default' : gameResult === 'close' ? 'secondary' : 'destructive'}>
                  {gameResult === 'correct' && '🎉 Perfect! +10 points'}
                  {gameResult === 'close' && '👍 Close! +5 points'}
                  {gameResult === 'wrong' && '❌ Not quite right!'}
                </Badge>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Game Over!</h3>
            <p className="text-lg">Final Score: <span className="text-yellow-400">{score}/50</span></p>
            <Button 
              onClick={() => {
                setScore(0);
                setRound(1);
                startNewRound();
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}