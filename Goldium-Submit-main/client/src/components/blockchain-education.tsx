import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Coins, Shield, Zap, TrendingUp, Users, Globe, RefreshCw, Clock } from 'lucide-react';
import { educationContentService, type EducationModule, type BlockchainStats } from '@/services/education-content-service';

// Icon mapping for dynamic modules
const getModuleIcon = (category: string) => {
  switch (category) {
    case 'Fundamentals': return <Globe className="w-6 h-6" />;
    case 'Technology': return <Zap className="w-6 h-6" />;
    case 'DeFi': return <Coins className="w-6 h-6" />;
    case 'Security': return <Shield className="w-6 h-6" />;
    case 'Trading': return <TrendingUp className="w-6 h-6" />;
    case 'Governance': return <Users className="w-6 h-6" />;
    default: return <BookOpen className="w-6 h-6" />;
  }
};

export function BlockchainEducation() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [educationModules, setEducationModules] = useState<EducationModule[]>([]);
  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<EducationModule[]>([]);

  // Load education content from dynamic service
  useEffect(() => {
    loadEducationContent();
  }, []);

  // Update recommendations when completed modules change
  useEffect(() => {
    if (educationModules.length > 0) {
      loadRecommendations();
    }
  }, [completedModules, educationModules]);

  const loadEducationContent = async () => {
    try {
      setIsLoading(true);
      const [modules, stats, trending] = await Promise.all([
        educationContentService.fetchEducationModules(),
        educationContentService.fetchBlockchainStats(),
        educationContentService.fetchTrendingTopics()
      ]);
      
      setEducationModules(modules);
      setBlockchainStats(stats);
      setTrendingTopics(trending);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load education content:', error);
      // Fallback to basic modules if service fails
      setEducationModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await educationContentService.getPersonalizedRecommendations(
        Array.from(completedModules)
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const refreshContent = () => {
    loadEducationContent();
  };

  const handleModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const selectedModuleData = educationModules.find(m => m.id === selectedModule);

  if (selectedModule && selectedModuleData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedModule(null)}
            className="mb-4"
          >
            ← Back to Modules
          </Button>
          <div className="flex items-center gap-2 text-sm text-galaxy-muted">
            <Clock className="w-4 h-4" />
            <span>Updated: {lastUpdated?.toLocaleTimeString()}</span>
          </div>
        </div>
        
        <Card className="bg-galaxy-card border-galaxy-purple/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getModuleIcon(selectedModuleData.category)}
              <div>
                <CardTitle className="text-2xl text-galaxy-text">{selectedModuleData.title}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{selectedModuleData.level}</Badge>
                  <Badge variant="outline">{selectedModuleData.duration}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedModuleData.category}
                  </Badge>
                  {selectedModuleData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs text-galaxy-muted">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedModuleData.content }}
            />
            
            <div className="flex justify-between items-center pt-6 border-t border-galaxy-purple/20">
              <div className="text-sm text-galaxy-muted">
                Progress: Reading {selectedModuleData.title}
                <br />
                <span className="text-xs">Last updated: {new Date(selectedModuleData.lastUpdated).toLocaleDateString()}</span>
              </div>
              <Button 
                onClick={() => handleModuleComplete(selectedModuleData.id)}
                disabled={completedModules.has(selectedModuleData.id)}
                className="bg-galaxy-purple hover:bg-galaxy-blue"
              >
                {completedModules.has(selectedModuleData.id) ? 'Completed ✓' : 'Mark Complete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-galaxy-text">Blockchain Education Hub</h2>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-galaxy-blue"></div>
            <span className="ml-3 text-galaxy-muted">Loading dynamic content from blockchain...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-3xl font-bold text-galaxy-text">Blockchain Education Hub</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshContent}
            className="text-galaxy-muted hover:text-galaxy-bright"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-galaxy-muted max-w-2xl mx-auto">
          Master blockchain technology, Solana architecture, and DeFi protocols through comprehensive educational modules with real-time data.
        </p>
        
        {/* Real-time stats banner */}
        {blockchainStats && (
          <div className="bg-galaxy-card border border-galaxy-purple/30 rounded-lg p-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-galaxy-blue">{blockchainStats.currentTPS.toLocaleString()}</div>
                <div className="text-xs text-galaxy-muted">Current TPS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-galaxy-purple">{blockchainStats.avgBlockTime}ms</div>
                <div className="text-xs text-galaxy-muted">Block Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-galaxy-green">{blockchainStats.activeValidators.toLocaleString()}</div>
                <div className="text-xs text-galaxy-muted">Validators</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-galaxy-yellow">{blockchainStats.networkHealth}</div>
                <div className="text-xs text-galaxy-muted">Network Health</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Trending topics */}
        {trendingTopics.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-galaxy-muted">Trending:</span>
            {trendingTopics.map(topic => (
              <Badge key={topic} variant="outline" className="text-xs">
                🔥 {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Personalized recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-galaxy-text">Recommended for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((module) => (
              <Card 
                key={`rec-${module.id}`}
                className="bg-gradient-to-br from-galaxy-purple/10 to-galaxy-blue/10 border-galaxy-blue/50 hover:border-galaxy-blue transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedModule(module.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getModuleIcon(module.category)}
                    <span className="text-sm font-medium text-galaxy-text">{module.title}</span>
                    <Badge variant="outline" className="text-xs ml-auto">Recommended</Badge>
                  </div>
                  <p className="text-xs text-galaxy-muted">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {educationModules.map((module) => (
          <Card 
            key={module.id}
            className="bg-galaxy-card border-galaxy-purple/30 hover:border-galaxy-blue/50 transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedModule(module.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-galaxy-purple/20 group-hover:bg-galaxy-blue/20 transition-colors">
                    {getModuleIcon(module.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-galaxy-text group-hover:text-galaxy-blue transition-colors">
                      {module.title}
                    </CardTitle>
                  </div>
                </div>
                {completedModules.has(module.id) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    ✓
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-galaxy-muted text-sm leading-relaxed">
                {module.description}
              </p>
              
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={module.level === 'Essential' ? 'default' : 'secondary'}
                  className={module.level === 'Essential' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                >
                  {module.level}
                </Badge>
                <Badge variant="outline" className="text-galaxy-muted">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {module.duration}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {module.category}
                </Badge>
              </div>
              
              <div className="flex gap-1 flex-wrap">
                {module.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs text-galaxy-muted">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full group-hover:bg-galaxy-purple/20 transition-colors"
              >
                Start Learning →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-8 space-y-4">
        <div className="inline-flex items-center gap-2 text-sm text-galaxy-muted">
          <Code className="w-4 h-4" />
          <span>Completed: {completedModules.size} / {educationModules.length} modules</span>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center justify-center gap-2 text-xs text-galaxy-muted">
            <Clock className="w-3 h-3" />
            <span>Content last updated: {lastUpdated.toLocaleString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshContent}
              className="text-xs text-galaxy-muted hover:text-galaxy-bright ml-2"
            >
              Refresh
            </Button>
          </div>
        )}
        
        <div className="text-xs text-galaxy-muted">
          📡 Powered by real-time Solana blockchain data
        </div>
      </div>
    </div>
  );
}