import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatGPTAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatGPTAssistant({ isOpen, onClose }: ChatGPTAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your lighting design assistant. I can help you with product recommendations, lighting tips, and creating the perfect ambiance for your space. What would you like to know?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock ChatGPT responses for demo
  const mockResponses = {
    "cozy": "For cozy lighting, I recommend warm white LEDs (2700K-3000K) with dimming capabilities. Try layering your lighting with table lamps, floor lamps, and accent lighting. Consider our pendant lights with warm bulbs!",
    "bright": "For bright spaces, use cool white LEDs (4000K-5000K) or daylight bulbs (5000K-6500K). Overhead lighting combined with task lighting works great. Our LED strip lights offer excellent brightness control!",
    "bedroom": "Bedroom lighting should be relaxing. Use warm, dimmable lights. Bedside lamps, string lights, or wall sconces create perfect ambiance. Avoid harsh overhead lighting before sleep.",
    "kitchen": "Kitchen needs bright task lighting for cooking. Under-cabinet LED strips, pendant lights over islands, and recessed ceiling lights work well. Mix warm and cool tones for versatility.",
    "living room": "Living rooms benefit from layered lighting: ambient (ceiling fixtures), task (reading lamps), and accent (wall sconces). Use dimmers to adjust mood throughout the day."
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(mockResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    // Default responses
    if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
      return "I'd be happy to help! I can assist with lighting recommendations, room design tips, product selection, and creating the right ambiance. What specific lighting challenge are you facing?";
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('recommend')) {
      return "Based on your needs, I can recommend from our collection: pendant lights for dining areas, chandeliers for luxury spaces, LED strips for accent lighting, or floor lamps for task lighting. What type of space are you lighting?";
    }
    
    return "That's a great question! For the best lighting advice, could you tell me more about your space - room type, size, and what kind of atmosphere you're trying to create?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputValue),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg h-96 bg-galaxy-card border-galaxy-purple/30 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-galaxy-bright flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">🤖</span>
              Lighting Assistant
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-galaxy-accent hover:text-galaxy-bright"
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === 'user' 
                        ? 'bg-blue-gradient text-white' 
                        : 'bg-galaxy-secondary text-galaxy-bright'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-galaxy-secondary text-galaxy-bright p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-galaxy-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-galaxy-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-galaxy-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 mt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about lighting tips, products, or room design..."
              className="flex-1 bg-galaxy-button border-galaxy-purple/30 text-galaxy-bright placeholder:text-galaxy-accent"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-gradient hover:opacity-90 text-white"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Floating chat button component
export function FloatingChatButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-gradient hover:opacity-90 text-white shadow-lg z-40"
      size="sm"
    >
      💬
    </Button>
  );
}