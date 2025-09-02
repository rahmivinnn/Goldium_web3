import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function NumberMemoryGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'show' | 'input' | 'result'>('show');
  const [displayNumber, setDisplayNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateSequence = (length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 10));
    }
    return newSequence;
  };

  const startLevel = () => {
    const newSequence = generateSequence(level + 2);
    setSequence(newSequence);
    setUserInput('');
    setPhase('show');
    setDisplayNumber(newSequence.join(''));
    setTimeLeft(Math.max(2, 5 - level * 0.3));
  };

  const checkAnswer = () => {
    const correct = userInput === sequence.join('');
    if (correct) {
      setScore(score + level * 10);
      setLevel(level + 1);
      setPhase('result');
      setTimeout(() => startLevel(), 1500);
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setGameOver(false);
    startLevel();
  };

  useEffect(() => {
    startLevel();
  }, []);

  useEffect(() => {
    if (phase === 'show' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 0.1);
      }, 100);
      return () => clearTimeout(timer);
    } else if (phase === 'show' && timeLeft <= 0) {
      setPhase('input');
      setDisplayNumber('');
    }
  }, [phase, timeLeft]);

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
      <CardHeader>
        <CardTitle className="text-xl text-center">Number Memory</CardTitle>
        <div className="flex justify-between text-sm">
          <span>Level: {level}</span>
          <span>Score: {score}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameOver ? (
          <>
            {phase === 'show' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-300">Memorize this number:</p>
                <div className="text-4xl font-mono font-bold text-green-400 bg-slate-800 p-4 rounded-lg">
                  {displayNumber}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${(timeLeft / Math.max(2, 5 - level * 0.3)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {phase === 'input' && (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-300">
                  Enter the number you saw:
                </p>
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Type the number..."
                  className="text-center text-xl font-mono bg-slate-800 border-gray-600"
                  maxLength={sequence.length}
                />
                <Button 
                  onClick={checkAnswer}
                  disabled={userInput.length !== sequence.length}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                >
                  Submit
                </Button>
              </div>
            )}

            {phase === 'result' && (
              <div className="text-center space-y-2">
                <div className="text-2xl">🎉</div>
                <p className="text-green-400 font-semibold">Correct!</p>
                <p className="text-sm text-gray-300">+{level * 10} points</p>
                <p className="text-sm text-gray-300">Level {level + 1} starting...</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-red-400">Game Over!</h3>
            <p className="text-lg">You reached Level {level}</p>
            <p className="text-lg">Final Score: <span className="text-green-400">{score}</span></p>
            <Button 
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}