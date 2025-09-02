import React, { useEffect, useRef, useState } from 'react';
import { Zap, Shield, TrendingUp } from 'lucide-react';

interface ParallaxHeroProps {
  children?: React.ReactNode;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({ children }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* Parallax Background Layers */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-black pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />
      
      {/* Floating Elements with Parallax */}
      <div 
        className="absolute top-20 left-10 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse-custom opacity-60"
        style={{
          transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10 + scrollY * 0.3}px)`
        }}
      />
      <div 
        className="absolute top-40 right-20 w-1 h-1 bg-yellow-400/50 rounded-full animate-pulse-custom opacity-40"
        style={{
          transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * 15 + scrollY * 0.4}px)`,
          animationDelay: '1s'
        }}
      />
      <div 
        className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-yellow-300/70 rounded-full animate-pulse-custom opacity-50"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * -10 + scrollY * 0.2}px)`,
          animationDelay: '2s'
        }}
      />
      <div 
        className="absolute bottom-60 right-1/3 w-1 h-1 bg-orange-400/40 rounded-full animate-pulse-custom opacity-30"
        style={{
          transform: `translate(${mousePosition.x * -25}px, ${mousePosition.y * 20 + scrollY * 0.6}px)`,
          animationDelay: '0.5s'
        }}
      />

      {/* Additional Floating Geometric Shapes */}
      <div 
        className="absolute top-1/3 left-1/4 w-4 h-4 border border-yellow-400/30 rotate-45 animate-spin-slow"
        style={{
          transform: `translate(${mousePosition.x * 12}px, ${mousePosition.y * 8 + scrollY * 0.35}px) rotate(45deg)`
        }}
      />
      <div 
        className="absolute top-2/3 right-1/4 w-6 h-6 border border-yellow-400/20 rounded-full animate-pulse-custom"
        style={{
          transform: `translate(${mousePosition.x * -18}px, ${mousePosition.y * -12 + scrollY * 0.25}px)`
        }}
      />
      <div 
        className="absolute top-1/2 left-3/4 w-3 h-3 bg-yellow-400/30 rotate-12 animate-bounce-slow"
        style={{
          transform: `translate(${mousePosition.x * 8}px, ${mousePosition.y * 15 + scrollY * 0.45}px) rotate(12deg)`
        }}
      />

      {/* Main Content with Parallax */}
      <div 
        className="relative z-10"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      >
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-12">
            {/* Main Title with Enhanced Parallax */}
            <div 
              className="animate-bounce-in"
              style={{
                transform: `translateY(${scrollY * 0.05}px) scale(${1 + mousePosition.y * 0.02})`
              }}
            >
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black leading-none tracking-tighter">
                <span className="inline-block animate-letter-float bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent" style={{animationDelay: '0s'}}>G</span>
          <span className="inline-block animate-letter-float bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent" style={{animationDelay: '0.1s'}}>O</span>
          <span className="inline-block animate-letter-float bg-gradient-to-r from-amber-400 via-yellow-400 to-yellow-300 bg-clip-text text-transparent" style={{animationDelay: '0.2s'}}>L</span>
          <span className="inline-block animate-letter-float bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent" style={{animationDelay: '0.3s'}}>D</span>
          <span className="inline-block animate-letter-float bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent" style={{animationDelay: '0.4s'}}>I</span>
          <span className="inline-block animate-letter-float bg-gradient-to-r from-amber-400 via-yellow-400 to-yellow-300 bg-clip-text text-transparent" style={{animationDelay: '0.5s'}}>U</span>
          <span className="inline-block animate-letter-float bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent" style={{animationDelay: '0.6s'}}>M</span>
              </h1>
            </div>

            {/* Animated subtitle with Parallax */}
            <div 
              className="animate-slide-up" 
              style={{
                animationDelay: '0.5s',
                transform: `translateY(${scrollY * 0.08}px)`
              }}
            >
              <p className="text-3xl md:text-4xl font-light text-gray-200 max-w-4xl mx-auto leading-relaxed">
                The Ultimate Solana DeFi Experience
              </p>
            </div>

            {/* Typewriter effect description with Parallax */}
            <div 
              className="animate-slide-up" 
              style={{
                animationDelay: '1s',
                transform: `translateY(${scrollY * 0.12}px)`
              }}
            >
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Swap, stake, and earn with GOLD tokens on Solana's lightning-fast blockchain.
                Experience next-generation DeFi with institutional-grade security and unmatched performance.
              </p>
            </div>

            {/* Animated feature highlights with Mouse Interaction */}
            <div 
              className="stagger-children flex flex-wrap justify-center gap-8 pt-6"
              style={{
                transform: `translateY(${scrollY * 0.15}px)`
              }}
            >
              <div 
                className="flex items-center space-x-3 text-gray-300 hover-glow px-4 py-2 rounded-full border border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300 cursor-pointer"
                style={{
                  transform: `translate(${mousePosition.x * 3}px, ${mousePosition.y * 2}px)`
                }}
              >
                <Zap className="w-6 h-6 text-yellow-400 animate-wiggle" />
                <span className="font-medium">Lightning Fast</span>
              </div>
              <div 
                className="flex items-center space-x-3 text-gray-300 hover-glow px-4 py-2 rounded-full border border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300 cursor-pointer"
                style={{
                  transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * 3}px)`
                }}
              >
                <Shield className="w-6 h-6 text-yellow-400 animate-pulse-custom" />
                <span className="font-medium">Secure</span>
              </div>
              <div 
                className="flex items-center space-x-3 text-gray-300 hover-glow px-4 py-2 rounded-full border border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300 cursor-pointer"
                style={{
                  transform: `translate(${mousePosition.x * 4}px, ${mousePosition.y * -1}px)`
                }}
              >
                <TrendingUp className="w-6 h-6 text-yellow-400 animate-bounce" />
                <span className="font-medium">High Yield</span>
              </div>
            </div>

            {/* Animated CTA Buttons with Enhanced Parallax */}
            <div 
              className="pt-8 flex flex-col sm:flex-row gap-6 justify-center animate-fade-scale" 
              style={{
                animationDelay: '1.5s',
                transform: `translateY(${scrollY * 0.2}px) scale(${1 + mousePosition.y * 0.01})`
              }}
            >
              <button
                onClick={() => document.getElementById('defi')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-gradient-to-r from-yellow-400 to-amber-400 text-black px-12 py-4 text-xl font-semibold rounded-full hover:from-yellow-300 hover:to-amber-300 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl shadow-lg relative overflow-hidden"
                style={{
                  transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 1}px)`
                }}
              >
                <span className="relative z-10 font-black">Launch DeFi App</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => document.getElementById('tokenomics')?.scrollIntoView({ behavior: 'smooth' })}
                className="group border-2 border-yellow-400/60 text-yellow-300 px-12 py-4 text-xl font-semibold rounded-full hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-200 transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                style={{
                  transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * 2}px)`
                }}
              >
                <span className="relative z-10 font-black">View Tokenomics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default ParallaxHero;