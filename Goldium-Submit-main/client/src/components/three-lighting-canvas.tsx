import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface LightingCanvasProps {
  onProductSelect?: (productId: string) => void;
}

export function ThreeLightingCanvas({ onProductSelect }: LightingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState([80]);
  const [warmth, setWarmth] = useState([70]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize 3D canvas with basic lighting scene
    const initCanvas = async () => {
      if (!canvasRef.current) return;
      
      try {
        // Create basic WebGL context for 3D rendering
        const gl = canvasRef.current.getContext('webgl');
        if (!gl) {
          console.error('WebGL not supported');
          return;
        }

        // Set canvas size
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Create gradient background
        gl.clearColor(0.1, 0.1, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Simple room visualization with lighting effect
        const drawRoom = () => {
          gl.clearColor(0.1 + brightness[0] * 0.01, 0.1 + brightness[0] * 0.01, 0.2 + warmth[0] * 0.01, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        };

        drawRoom();
        setIsLoading(false);

      } catch (error) {
        console.error('Failed to initialize 3D canvas:', error);
        setIsLoading(false);
      }
    };

    initCanvas();
  }, [brightness, warmth]);

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30">
      <CardHeader>
        <CardTitle className="text-galaxy-bright flex items-center">
          <span className="mr-2">💡</span>
          Interactive Lighting Designer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Canvas */}
        <div className="relative bg-galaxy-secondary/50 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-64 cursor-grab active:cursor-grabbing"
            style={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-galaxy-secondary/80">
              <div className="text-galaxy-bright">Loading 3D Scene...</div>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-galaxy-secondary/80 rounded px-2 py-1 text-xs text-galaxy-accent">
            🔄 Drag to rotate • 🖱️ Click to place lights
          </div>
        </div>

        {/* Lighting Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-galaxy-bright">Brightness</label>
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-galaxy-accent">{brightness[0]}%</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-galaxy-bright">Warmth</label>
            <Slider
              value={warmth}
              onValueChange={setWarmth}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-galaxy-accent">{warmth[0]}% warm</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-galaxy-button border-galaxy-purple/30 text-galaxy-bright hover:bg-galaxy-purple/20"
            onClick={() => {
              setBrightness([100]);
              setWarmth([30]);
            }}
          >
            ☀️ Bright & Cool
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-galaxy-button border-galaxy-purple/30 text-galaxy-bright hover:bg-galaxy-purple/20"
            onClick={() => {
              setBrightness([40]);
              setWarmth([80]);
            }}
          >
            🕯️ Cozy & Warm
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-galaxy-button border-galaxy-purple/30 text-galaxy-bright hover:bg-galaxy-purple/20"
            onClick={() => {
              setBrightness([70]);
              setWarmth([50]);
            }}
          >
            🏠 Ambient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}