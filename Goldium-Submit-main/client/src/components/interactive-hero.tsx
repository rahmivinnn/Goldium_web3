import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Zap, Shield } from 'lucide-react';

export const InteractiveHero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse movement updates
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 16); // ~60fps
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Throttle scroll updates
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollY(window.scrollY);
      }, 16); // ~60fps
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(mouseTimeout);
      clearTimeout(scrollTimeout);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mouse-based parallax
  const mouseParallax = {
    x: (mousePosition.x - window.innerWidth / 2) * 0.01,
    y: (mousePosition.y - window.innerHeight / 2) * 0.01,
  };

  // Scroll-based parallax with different speeds for depth
  const scrollParallax = {
    slow: scrollY * 0.2,
    medium: scrollY * 0.4,
    fast: scrollY * 0.6,
    ultraFast: scrollY * 0.8,
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black grid-background">
      {/* Background parallax layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Far background layer - slowest */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollParallax.slow}px)`,
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        {/* Mid background layer - medium speed */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            transform: `translateY(${scrollParallax.medium}px)`,
          }}
        >
          <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-400/20 rounded-lg rotate-45 blur-xl" />
          <div className="absolute top-1/3 right-20 w-20 h-20 bg-yellow-300/20 rounded-lg rotate-12 blur-xl" />
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-yellow-500/20 rounded-full blur-xl" />
        </div>

        {/* Floating geometric shapes - enhanced with scroll parallax */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollParallax.fast}px)`,
          }}
        >
          <div 
            className="absolute top-20 left-20 w-4 h-4 bg-yellow-400 rotate-45 float-element"
            style={{
              transform: `translate(${mouseParallax.x * 2}px, ${mouseParallax.y * 2}px) rotate(${45 + scrollY * 0.1}deg)`,
              animationDelay: '0s'
            }}
          />
          <div 
            className="absolute top-40 right-32 w-6 h-6 border-2 border-yellow-400 rotate-12 float-element"
            style={{
              transform: `translate(${mouseParallax.x * -1.5}px, ${mouseParallax.y * -1.5}px) rotate(${12 + scrollY * 0.05}deg)`,
              animationDelay: '1s'
            }}
          />
          <div 
            className="absolute bottom-32 left-1/4 w-3 h-3 bg-yellow-300 rounded-full float-element"
            style={{
              transform: `translate(${mouseParallax.x * 3}px, ${mouseParallax.y * 3}px) scale(${1 + Math.sin(scrollY * 0.01) * 0.2})`,
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute bottom-40 right-1/4 w-5 h-5 border border-yellow-500 transform rotate-45 float-element"
            style={{
              transform: `translate(${mouseParallax.x * -2}px, ${mouseParallax.y * -2}px) rotate(${45 + scrollY * 0.08}deg)`,
              animationDelay: '0.5s'
            }}
          />
        </div>

        {/* Additional floating elements for depth */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollParallax.ultraFast}px)`,
          }}
        >
          <div 
            className="absolute top-1/3 left-10 w-2 h-2 bg-yellow-500 rounded-full opacity-80"
            style={{
              transform: `translate(${mouseParallax.x * 4}px, ${mouseParallax.y * 4}px)`,
            }}
          />
          <div 
            className="absolute top-2/3 right-10 w-3 h-3 border border-yellow-400 rotate-45 opacity-60"
            style={{
              transform: `translate(${mouseParallax.x * -3}px, ${mouseParallax.y * -3}px) rotate(${45 + scrollY * 0.15}deg)`,
            }}
          />
          <div 
            className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-yellow-300 rounded-full opacity-70"
            style={{
              transform: `translate(${mouseParallax.x * 5}px, ${mouseParallax.y * 5}px)`,
            }}
          />
        </div>
      </div>

      {/* Main content with parallax */}
      <div 
        className="relative z-10 text-center space-y-8 px-6 max-w-6xl mx-auto"
        style={{
          transform: `translateY(${scrollParallax.slow * 0.5}px)`,
        }}
      >
        {/* Main title with interactive effects */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h1 className={`text-8xl md:text-9xl lg:text-[12rem] font-black leading-none tracking-tighter transition-all duration-500 ${
            isHovered ? 'text-yellow-300' : 'text-yellow-400'
          }`}>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer">G</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer" style={{animationDelay: '0.1s'}}>O</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer" style={{animationDelay: '0.2s'}}>L</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer" style={{animationDelay: '0.3s'}}>D</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer" style={{animationDelay: '0.4s'}}>I</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer" style={{animationDelay: '0.5s'}}>U</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer" style={{animationDelay: '0.6s'}}>M</span>
          </h1>
          
          {/* Scanning line effect */}
          <div className="absolute inset-0 scan-line opacity-50" />
        </div>

        {/* Subtitle with glow effect */}
        <div className="space-y-4">
          <p className="text-2xl md:text-3xl text-yellow-300 font-light tracking-wide">
            The Future of <span className="font-bold">DeFi</span> is Here
          </p>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience next-generation decentralized finance with cutting-edge technology,
            seamless transactions, and revolutionary staking rewards.
          </p>
        </div>

        {/* Interactive feature cards with parallax */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          style={{
            transform: `translateY(${scrollParallax.medium * 0.3}px)`,
          }}
        >
          <div 
            className="interactive-card bg-black/50 backdrop-blur-sm p-6 rounded-lg hover:bg-black/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
            style={{
              transform: `translateY(${scrollParallax.fast * 0.1}px) translateX(${mouseParallax.x * 0.5}px)`,
            }}
          >
            <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-yellow-300 font-semibold mb-2">High Yield</h3>
            <p className="text-gray-400 text-sm">Up to 12% APY staking rewards</p>
          </div>
          
          <div 
            className="interactive-card bg-black/50 backdrop-blur-sm p-6 rounded-lg hover:bg-black/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
            style={{
              transform: `translateY(${scrollParallax.fast * 0.05}px)`,
            }}
          >
            <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-yellow-300 font-semibold mb-2">Secure</h3>
            <p className="text-gray-400 text-sm">Audited smart contracts</p>
          </div>
          
          <div 
            className="interactive-card bg-black/50 backdrop-blur-sm p-6 rounded-lg hover:bg-black/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
            style={{
              transform: `translateY(${scrollParallax.fast * 0.1}px) translateX(${mouseParallax.x * -0.5}px)`,
            }}
          >
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-yellow-300 font-semibold mb-2">Fast</h3>
            <p className="text-gray-400 text-sm">Lightning-fast transactions</p>
          </div>
        </div>

        {/* CTA Buttons with parallax */}
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          style={{
            transform: `translateY(${scrollParallax.medium * 0.4}px)`,
          }}
        >
          <button 
            className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            style={{
              transform: `translateX(${mouseParallax.x * 0.3}px) translateY(${mouseParallax.y * 0.3}px)`,
            }}
          >
            Start Trading
          </button>
          <button 
            className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 font-bold rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            style={{
              transform: `translateX(${mouseParallax.x * -0.3}px) translateY(${mouseParallax.y * -0.3}px)`,
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Animated background elements with enhanced parallax */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 animate-pulse" 
          style={{
            transform: `translateY(${scrollParallax.ultraFast * 0.1}px)`,
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 animate-pulse" 
          style={{
            animationDelay: '1s',
            transform: `translateY(${scrollParallax.ultraFast * -0.1}px)`,
          }} 
        />
        <div 
          className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-20 animate-pulse" 
          style={{
            animationDelay: '0.5s',
            transform: `translateX(${scrollParallax.ultraFast * 0.05}px)`,
          }} 
        />
        <div 
          className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-20 animate-pulse" 
          style={{
            animationDelay: '1.5s',
            transform: `translateX(${scrollParallax.ultraFast * -0.05}px)`,
          }} 
        />
        
        {/* Additional depth elements */}
        <div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"
          style={{
            transform: `translate(-50%, -50%) translateY(${scrollParallax.slow * 0.8}px) scale(${1 + Math.sin(scrollY * 0.005) * 0.1})`,
          }}
        />
        <div 
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-300/5 rounded-full blur-2xl"
          style={{
            transform: `translateY(${scrollParallax.medium * 0.6}px) translateX(${scrollParallax.medium * 0.2}px)`,
          }}
        />
      </div>
    </div>
  );
};

export default InteractiveHero;