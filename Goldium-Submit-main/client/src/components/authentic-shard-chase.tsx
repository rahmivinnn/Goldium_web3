import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy, Coins, Users, Crosshair } from 'lucide-react';

interface GameObject {
  id: string;
  x: number;
  y: number;
  type: 'shard' | 'player' | 'obstacle';
  value?: number;
  collected?: boolean;
  sprite?: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  x: number;
  y: number;
  color: string;
}

export function AuthenticShardChase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { id: 'player', name: 'You', score: 0, x: 250, y: 250, color: '#00ff88' },
    { id: 'bot1', name: 'ShardHunter', score: 0, x: 150, y: 150, color: '#ff6b6b' },
    { id: 'bot2', name: 'CryptoMiner', score: 0, x: 350, y: 350, color: '#4ecdc4' },
    { id: 'bot3', name: 'DeFiLord', score: 0, x: 100, y: 400, color: '#ffe66d' }
  ]);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [nextShardIn, setNextShardIn] = useState(3);
  const [playerScore, setPlayerScore] = useState(0);

  // Create authentic game sprites using canvas drawing
  const drawPixelShip = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 12) => {
    ctx.fillStyle = color;
    // Main body
    ctx.fillRect(x-size/2, y-size/3, size, size/1.5);
    // Wings
    ctx.fillRect(x-size*0.8, y, size*0.4, size*0.3);
    ctx.fillRect(x+size*0.4, y, size*0.4, size*0.3);
    // Engine glow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x-size/4, y+size/3, size/2, size/6);
  };

  const drawPixelShard = (ctx: CanvasRenderingContext2D, x: number, y: number, value: number, pulse: number) => {
    const size = 8 + pulse * 2;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${0.8 - pulse * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - size*2, y - size*2, size*4, size*4);
    
    // Crystal shape
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size*0.6, y - size*0.3);
    ctx.lineTo(x + size*0.6, y + size*0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size*0.6, y + size*0.3);
    ctx.lineTo(x - size*0.6, y - size*0.3);
    ctx.closePath();
    ctx.fill();
    
    // Inner highlight
    ctx.fillStyle = '#ffff99';
    ctx.fillRect(x-2, y-size*0.5, 4, size);
    
    // Value indicator
    ctx.fillStyle = '#000';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x, y + 2);
  };

  const drawTileBackground = (ctx: CanvasRenderingContext2D) => {
    const tileSize = 25;
    
    // Dark space background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 500, 500);
    
    // Subtle grid pattern
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= 500; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    
    for (let y = 0; y <= 500; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(500, y);
      ctx.stroke();
    }
    
    // Random space dots (stars)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % 500;
      const y = (i * 211) % 500;
      const size = (i % 3) * 0.5 + 0.5;
      ctx.fillRect(x, y, size, size);
    }
  };

  const gameLoop = useCallback((currentTime: number) => {
    if (!canvasRef.current || gameState !== 'playing') return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Clear and draw background
    drawTileBackground(ctx);
    
    // Draw game objects
    const pulse = Math.sin(currentTime * 0.005) * 0.5 + 0.5;
    
    gameObjects.forEach(obj => {
      if (obj.type === 'shard' && !obj.collected) {
        drawPixelShard(ctx, obj.x, obj.y, obj.value || 1, pulse);
      }
    });
    
    // Draw players
    players.forEach(player => {
      drawPixelShip(ctx, player.x, player.y, player.color);
      
      // Player name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.x, player.y - 20);
      
      // Score indicator
      if (player.score > 0) {
        ctx.fillStyle = player.color;
        ctx.fillText(`${player.score}`, player.x, player.y + 25);
      }
    });
    
    // Bot AI movement
    setPlayers(prev => prev.map(player => {
      if (player.id === 'player') return player;
      
      // Simple AI: move towards nearest shard
      const nearestShard = gameObjects.find(obj => 
        obj.type === 'shard' && !obj.collected
      );
      
      if (nearestShard) {
        const dx = nearestShard.x - player.x;
        const dy = nearestShard.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          const speed = 0.8;
          player.x += (dx / distance) * speed;
          player.y += (dy / distance) * speed;
          
          // Keep in bounds
          player.x = Math.max(15, Math.min(485, player.x));
          player.y = Math.max(15, Math.min(485, player.y));
        }
        
        // Bot collection check
        if (distance < 15) {
          setGameObjects(prevObjects => 
            prevObjects.map(obj => 
              obj.id === nearestShard.id ? { ...obj, collected: true } : obj
            )
          );
          player.score += nearestShard.value || 1;
        }
      }
      
      return player;
    }));

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameObjects, players]);

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Spawn shards periodically
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const spawnInterval = setInterval(() => {
      const newShard: GameObject = {
        id: `shard_${Date.now()}`,
        x: Math.random() * 460 + 20,
        y: Math.random() * 460 + 20,
        type: 'shard',
        value: Math.floor(Math.random() * 5) + 1,
        collected: false
      };
      
      setGameObjects(prev => [...prev, newShard]);
      setNextShardIn(3);
    }, 3000);
    
    return () => clearInterval(spawnInterval);
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Move player
    setPlayers(prev => prev.map(p => 
      p.id === 'player' ? { ...p, x: clickX, y: clickY } : p
    ));
    
    // Check shard collection
    const clickedShard = gameObjects.find(obj => 
      obj.type === 'shard' && 
      !obj.collected && 
      Math.sqrt((clickX - obj.x) ** 2 + (clickY - obj.y) ** 2) < 20
    );
    
    if (clickedShard) {
      setGameObjects(prev => prev.map(obj => 
        obj.id === clickedShard.id ? { ...obj, collected: true } : obj
      ));
      setPlayerScore(prev => prev + (clickedShard.value || 1));
      setPlayers(prev => prev.map(p => 
        p.id === 'player' ? { ...p, score: p.score + (clickedShard.value || 1) } : p
      ));
    }
  };

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setNextShardIn(3);
    setPlayerScore(0);
    setGameObjects([]);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Crosshair className="w-6 h-6 text-amber-400" />
          Solana Shard Chase - Unity Style
        </CardTitle>
        <p className="text-sm text-slate-400">Authentic pixel art space mining game with real-time multiplayer action</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas */}
          <div className="flex-1">
            <div className="relative border-2 border-slate-600 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="cursor-crosshair block"
                onClick={handleCanvasClick}
              />
              
              {gameState === 'waiting' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">⚡</div>
                    <h3 className="text-xl font-bold text-white">Ready to Hunt Shards?</h3>
                    <p className="text-slate-300 max-w-xs">Navigate your ship through space, collect golden shards, and compete with AI miners!</p>
                    <Button onClick={startGame} className="bg-amber-600 hover:bg-amber-700">
                      Launch Mission
                    </Button>
                  </div>
                </div>
              )}
              
              {gameState === 'ended' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
                    <h3 className="text-xl font-bold text-white">Mission Complete!</h3>
                    <p className="text-slate-300">Final Score: {playerScore} shards collected</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={startGame} className="bg-amber-600 hover:bg-amber-700">
                        New Mission
                      </Button>
                      <Button variant="outline" className="border-amber-600 text-amber-400">
                        Claim {playerScore} GOLD
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center text-sm text-slate-400">
              Click anywhere to move your ship • Collect golden crystal shards • Compete with AI miners
            </div>
          </div>

          {/* Game Stats */}
          <div className="w-full lg:w-80 space-y-4">
            {gameState === 'playing' && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-red-900/30 border-red-600/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-mono text-red-400">{timeLeft}s</div>
                    <div className="text-xs text-slate-400">Mission Time</div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-900/30 border-amber-600/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-mono text-amber-400">{nextShardIn}s</div>
                    <div className="text-xs text-slate-400">Next Spawn</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="bg-emerald-900/30 border-emerald-600/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-white">Your Score</span>
                </div>
                <div className="text-3xl font-mono text-amber-400">{playerScore}</div>
                <div className="text-sm text-slate-400">Shards Mined</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Users className="w-4 h-4" />
                  Live Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {players.sort((a, b) => b.score - a.score).map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: player.color }}
                        />
                        <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className={`text-sm font-mono ${player.id === 'player' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          {player.name}
                        </span>
                      </div>
                      <span className="text-amber-400 font-mono text-sm">{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-white">Mission Briefing:</h4>
                <ul className="text-sm text-slate-400 space-y-1 leading-relaxed">
                  <li>• Navigate your mining ship through deep space</li>
                  <li>• Collect valuable crystal shards (1-5 GOLD each)</li>
                  <li>• Compete against AI-controlled miners</li>
                  <li>• Convert collected shards to GOLD tokens</li>
                  <li>• Mission duration: 60 seconds</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}