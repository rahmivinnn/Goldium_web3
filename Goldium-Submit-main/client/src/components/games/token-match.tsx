import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOKENS = ['🟣', '🔥', '🎒', '🔷', '⚡', '🚀', '💎', '🌟'];

interface CardType {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function TokenMatchGame() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = () => {
    // Create pairs of tokens
    const gameTokens = TOKENS.slice(0, 6); // Use 6 different tokens
    const cardPairs = [...gameTokens, ...gameTokens];
    
    // Shuffle the cards
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setGameWon(false);
    setTimeLeft(60);
    setGameStarted(true);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flippedCardIds: number[]) => {
    const [first, second] = flippedCardIds;
    const firstCard = cards[first];
    const secondCard = cards[second];

    setTimeout(() => {
      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        const newCards = [...cards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setScore(score + 100);

        // Check if all cards are matched
        if (newCards.every(card => card.isMatched)) {
          setGameWon(true);
          setGameStarted(false);
        }
      } else {
        // No match, flip back
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
      }
      setFlippedCards([]);
    }, 1000);
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameWon) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      setGameStarted(false);
    }
  }, [timeLeft, gameStarted, gameWon]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-xl text-center">Token Memory Match</CardTitle>
        <div className="flex justify-between text-sm">
          <span>Score: {score}</span>
          <span>Moves: {moves}</span>
          <span>Time: {formatTime(timeLeft)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameStarted && !gameWon ? (
          <div className="text-center space-y-4">
            <p className="text-gray-300">Match pairs of tokens to win!</p>
            <Button 
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              Start Game
            </Button>
          </div>
        ) : gameWon ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">🎉</div>
            <h3 className="text-xl font-bold text-green-400">You Win!</h3>
            <p className="text-lg">Score: {score}</p>
            <p className="text-sm text-gray-300">Completed in {moves} moves</p>
            <Button 
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              Play Again
            </Button>
          </div>
        ) : timeLeft === 0 ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">⏰</div>
            <h3 className="text-xl font-bold text-red-400">Time's Up!</h3>
            <p className="text-lg">Score: {score}</p>
            <Button 
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card) => (
              <Button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`h-16 text-2xl ${
                  card.isMatched 
                    ? 'bg-green-600 cursor-default' 
                    : card.isFlipped 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={card.isMatched || flippedCards.length === 2}
              >
                {card.isFlipped || card.isMatched ? card.symbol : '?'}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}