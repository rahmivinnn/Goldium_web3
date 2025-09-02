import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, MessageCircle, Heart, Repeat2 } from 'lucide-react';

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  totalTweets: number;
  trending: 'up' | 'down' | 'stable';
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export function GoldiumSentimentTrends() {
  const [sentiment, setSentiment] = useState<SentimentData>({
    positive: 68,
    neutral: 25,
    negative: 7,
    totalTweets: 142,
    trending: 'up',
    engagement: {
      likes: 1248,
      retweets: 387,
      replies: 94
    }
  });

  const [recentTweets] = useState([
    {
      id: '1',
      text: 'Just swapped 2 SOL for 43,000 GOLD tokens on @GoldiumOfficial! Lightning fast transaction and zero slippage 🚀⚡',
      sentiment: 'positive',
      engagement: { likes: 89, retweets: 34, replies: 12 },
      timestamp: '1h ago'
    },
    {
      id: '2',
      text: 'Staking 10,000 GOLD tokens with 5% APY on Goldium. Already earned 50 GOLD in rewards! The compound interest is real 📈💰',
      sentiment: 'positive', 
      engagement: { likes: 156, retweets: 67, replies: 23 },
      timestamp: '3h ago'
    },
    {
      id: '3',
      text: 'Goldium has the best DeFi UX on Solana. Phantom wallet integration is seamless, and the real-time analytics are amazing! 🔥',
      sentiment: 'positive',
      engagement: { likes: 234, retweets: 89, replies: 45 },
      timestamp: '5h ago'
    },
    {
      id: '4',
      text: 'Playing Solana Shard Chase and earning GOLD tokens while having fun! This is the future of GameFi 🎮🏆',
      sentiment: 'positive',
      engagement: { likes: 178, retweets: 56, replies: 34 },
      timestamp: '7h ago'
    },
    {
      id: '5',
      text: 'GOLD token price is holding strong at 0.00004654 SOL. The tokenomics and staking rewards make this a solid long-term hold 💎',
      sentiment: 'positive',
      engagement: { likes: 312, retweets: 123, replies: 67 },
      timestamp: '9h ago'
    }
  ]);

  useEffect(() => {
    // Simulate sentiment updates every 60 seconds to reduce load
    const interval = setInterval(() => {
      setSentiment(prev => ({
        ...prev,
        positive: Math.max(40, Math.min(80, prev.positive + (Math.random() - 0.5) * 10)),
        neutral: Math.max(15, Math.min(40, prev.neutral + (Math.random() - 0.5) * 5)),
        negative: Math.max(5, Math.min(25, prev.negative + (Math.random() - 0.5) * 3)),
        totalTweets: prev.totalTweets + Math.floor(Math.random() * 3),
        engagement: {
          likes: prev.engagement.likes + Math.floor(Math.random() * 10),
          retweets: prev.engagement.retweets + Math.floor(Math.random() * 5),
          replies: prev.engagement.replies + Math.floor(Math.random() * 3)
        }
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-galaxy-accent';
    }
  };

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-galaxy-blue/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-galaxy-bright">Social Sentiment</h3>
          <div className="flex items-center space-x-1">
            {sentiment.trending === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-galaxy-accent">{sentiment.totalTweets} tweets (24h)</span>
          </div>
        </div>

        {/* Sentiment Bars */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">Positive</span>
              <span className="text-green-400">{sentiment.positive}%</span>
            </div>
            <div className="h-2 bg-galaxy-darker rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${sentiment.positive}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-galaxy-accent">Neutral</span>
              <span className="text-galaxy-accent">{sentiment.neutral}%</span>
            </div>
            <div className="h-2 bg-galaxy-darker rounded-full overflow-hidden">
              <div 
                className="h-full bg-galaxy-accent transition-all duration-500"
                style={{ width: `${sentiment.neutral}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-400">Negative</span>
              <span className="text-red-400">{sentiment.negative}%</span>
            </div>
            <div className="h-2 bg-galaxy-darker rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${sentiment.negative}%` }}
              />
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-galaxy-darker/30 rounded-lg">
          <div className="text-center">
            <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-galaxy-bright">{sentiment.engagement.likes}</div>
            <div className="text-xs text-galaxy-accent">Likes</div>
          </div>
          <div className="text-center">
            <Repeat2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-galaxy-bright">{sentiment.engagement.retweets}</div>
            <div className="text-xs text-galaxy-accent">Retweets</div>
          </div>
          <div className="text-center">
            <MessageCircle className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-galaxy-bright">{sentiment.engagement.replies}</div>
            <div className="text-xs text-galaxy-accent">Replies</div>
          </div>
        </div>

        {/* Recent Tweets */}
        <div>
          <h4 className="text-sm font-medium text-galaxy-bright mb-3">Recent Mentions</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentTweets.map((tweet) => (
              <div key={tweet.id} className="p-3 bg-galaxy-darker/30 rounded-lg">
                <p className="text-sm text-galaxy-bright mb-2 line-clamp-2">{tweet.text}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{tweet.engagement.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Repeat2 className="w-3 h-3" />
                      <span>{tweet.engagement.retweets}</span>
                    </span>
                  </div>
                  <span className="text-galaxy-accent">{tweet.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}