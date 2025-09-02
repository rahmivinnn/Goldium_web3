import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, CheckCircle, XCircle } from 'lucide-react';

interface LearnTopic {
  id: string;
  title: string;
  content: string;
  quiz?: {
    question: string;
    options: string[];
    correct: number;
  };
}

const solanaTopics: LearnTopic[] = [
  {
    id: '1',
    title: 'What is Solana?',
    content: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today. With 400ms block times and low fees.',
    quiz: {
      question: 'What is Solana\'s block time?',
      options: ['400ms', '12 seconds', '2 minutes'],
      correct: 0
    }
  },
  {
    id: '2', 
    title: 'SPL Tokens',
    content: 'SPL (Solana Program Library) tokens are Solana\'s equivalent to Ethereum\'s ERC-20. GOLD is an SPL token on Solana mainnet.',
    quiz: {
      question: 'What does SPL stand for?',
      options: ['Solana Program Library', 'Simple Payment Layer', 'Smart Protocol Language'],
      correct: 0
    }
  },
  {
    id: '3',
    title: 'Phantom Wallet',
    content: 'Phantom is a crypto wallet built for DeFi & NFTs on Solana. It provides a secure way to store, send, receive, and swap tokens.',
    quiz: {
      question: 'Phantom wallet is built for which blockchain?',
      options: ['Ethereum', 'Solana', 'Bitcoin'],
      correct: 1
    }
  },
  {
    id: '4',
    title: 'Staking Rewards',
    content: 'Staking on Solana allows you to earn rewards by delegating SOL to validators. APY (Annual Percentage Yield) shows yearly returns.',
    quiz: {
      question: 'What does APY mean?',
      options: ['Annual Payment Yield', 'Annual Percentage Yield', 'Average Price Year'],
      correct: 1
    }
  }
];

export function SolanaLearnCard() {
  const [currentTopic, setCurrentTopic] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Auto-rotate topics every 30 seconds
    const interval = setInterval(() => {
      if (!showQuiz) {
        setCurrentTopic((prev) => (prev + 1) % solanaTopics.length);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showQuiz]);

  const topic = solanaTopics[currentTopic];

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    setTimeout(() => {
      setShowQuiz(false);
      setShowResult(false);
      setSelectedAnswer(null);
      setCurrentTopic((prev) => (prev + 1) % solanaTopics.length);
    }, 2000);
  };

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-blue-500/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-galaxy-bright">Learn Blockchain</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuiz(!showQuiz)}
            className="text-galaxy-accent hover:text-galaxy-bright"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showQuiz ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {!showQuiz ? (
          <div className="space-y-4">
            <h4 className="font-medium text-galaxy-bright">{topic.title}</h4>
            <p className="text-sm text-galaxy-accent leading-relaxed">{topic.content}</p>
            {topic.quiz && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowQuiz(true)}
                className="border-galaxy-purple/50 text-galaxy-accent hover:bg-galaxy-purple/20"
              >
                Take Quiz
              </Button>
            )}
          </div>
        ) : topic.quiz && (
          <div className="space-y-4">
            <h4 className="font-medium text-galaxy-bright">{topic.quiz.question}</h4>
            <div className="space-y-2">
              {topic.quiz.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuizAnswer(index)}
                  disabled={showResult}
                  className={`w-full justify-start text-left border-galaxy-purple/50 hover:bg-galaxy-purple/20 ${
                    showResult && index === topic.quiz!.correct
                      ? 'border-green-500 bg-green-500/20'
                      : showResult && index === selectedAnswer && index !== topic.quiz!.correct
                      ? 'border-red-500 bg-red-500/20'
                      : ''
                  }`}
                >
                  <span className="mr-2">{String.fromCharCode(65 + index)})</span>
                  {option}
                  {showResult && index === topic.quiz!.correct && (
                    <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
                  )}
                  {showResult && index === selectedAnswer && index !== topic.quiz!.correct && (
                    <XCircle className="w-4 h-4 ml-auto text-red-500" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex space-x-1 mt-4">
          {solanaTopics.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index === currentTopic ? 'bg-blue-500' : 'bg-galaxy-purple/30'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}