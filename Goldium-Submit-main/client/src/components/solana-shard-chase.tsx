import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy, Coins, Users } from 'lucide-react';

interface Shard {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

interface Player {
  id: string;
  name: string;
  score: number;
  position: { x: number; y: number };
}

export function SolanaShardChase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [shards, setShards] = useState<Shard[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'You', score: 0, position: { x: 250, y: 250 } },
    { id: '2', name: 'Hunter_SOL', score: 12, position: { x: 180, y: 320 } },
    { id: '3', name: 'ShardMaster', score: 8, position: { x: 320, y: 180 } },
    { id: '4', name: 'GoldRush', score: 15, position: { x: 150, y: 200 } }
  ]);
  const [playerPosition, setPlayerPosition] = useState({ x: 250, y: 250 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [nextShardIn, setNextShardIn] = useState(5);

  // Generate random shard every 5 seconds during game
  useEffect(() => {
    if (gameState === 'playing') {
      const shardInterval = setInterval(() => {
        const newShard: Shard = {
          id: Date.now().toString(),
          x: Math.random() * 450 + 25,
          y: Math.random() * 450 + 25,
          value: Math.floor(Math.random() * 5) + 1,
          collected: false
        };
        setShards(prev => [...prev, newShard]);
        setNextShardIn(5);
      }, 5000);

      return () => clearInterval(shardInterval);
    }
  }, [gameState]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setNextShardIn(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameState('ended');
    }
  }, [gameState, timeLeft]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 500, 500);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 500; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 500);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(500, i);
      ctx.stroke();
    }

    // Draw shards
    shards.forEach(shard => {
      if (!shard.collected) {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(shard.x, shard.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Shard value
        ctx.fillStyle = '#000';
        ctx.font = '12px bold monospace';
        ctx.textAlign = 'center';
        ctx.fillText(shard.value.toString(), shard.x, shard.y + 4);
      }
    });

    // Draw players
    players.forEach(player => {
      ctx.fillStyle = player.id === '1' ? '#00ff88' : '#ff6b6b';
      ctx.shadowColor = player.id === '1' ? '#00ff88' : '#ff6b6b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Player name
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.position.x, player.position.y - 20);
    });
  }, [shards, players, playerPosition]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked on a shard
    const clickedShard = shards.find(shard => 
      !shard.collected && 
      Math.sqrt((clickX - shard.x) ** 2 + (clickY - shard.y) ** 2) < 15
    );

    if (clickedShard) {
      setShards(prev => prev.map(s => 
        s.id === clickedShard.id ? { ...s, collected: true } : s
      ));
      setScore(prev => prev + clickedShard.value);
      setPlayers(prev => prev.map(p => 
        p.id === '1' ? { ...p, score: p.score + clickedShard.value } : p
      ));
    }

    // Move player to clicked position
    setPlayerPosition({ x: clickX, y: clickY });
    setPlayers(prev => prev.map(p => 
      p.id === '1' ? { ...p, position: { x: clickX, y: clickY } } : p
    ));
  };

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(30);
    setScore(0);
    setShards([]);
    setNextShardIn(5);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Zap className="w-6 h-6 text-yellow-400" />
          Solana Shard Chase
        </CardTitle>
        <p className="text-sm text-gray-400">Real-time multiplayer item hunt. Collect shards to earn GOLD tokens!</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas */}
          <div className="flex-1">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="border border-purple-500/30 rounded-lg cursor-crosshair"
                onClick={handleCanvasClick}
              />
              {gameState === 'waiting' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Ready to Hunt?</h3>
                    <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-blue-500">
                      Start Game
                    </Button>
                  </div>
                </div>
              )}
              {gameState === 'ended' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                    <p className="text-gray-300 mb-4">You collected {score} shards</p>
                    <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-blue-500">
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Stats */}
          <div className="w-full lg:w-80 space-y-4">
            {gameState === 'playing' && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{timeLeft}s</div>
                    <div className="text-xs text-gray-400">Time Left</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{nextShardIn}s</div>
                    <div className="text-xs text-gray-400">Next Shard</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">Your Score</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{score}</div>
                <div className="text-sm text-gray-400">Shards Collected</div>
              </CardContent>
            </Card>

            <Card className="bg-green-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {players.sort((a, b) => b.score - a.score).map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className={`text-sm ${player.id === '1' ? 'text-green-400 font-semibold' : 'text-gray-300'}`}>
                          {player.name}
                        </span>
                      </div>
                      <span className="text-yellow-400 font-mono">{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">How to Play:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Click on golden shards to collect them</li>
                  <li>• Each shard has different values (1-5)</li>
                  <li>• New shards appear every 5 seconds</li>
                  <li>• Compete with other hunters in real-time</li>
                  <li>• Convert shards to GOLD tokens after game</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}