import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import goldiumLogo from '@assets/k1xiYLna_400x400-removebg-preview_1754140723127.png';
import K1 from '@assets/K1.png';
import K2 from '@assets/K2.png';
import K3 from '@assets/K3.png';
import K4 from '@assets/K4.png';
import K5 from '@assets/K5.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const eggImages = [K1, K2, K3, K4, K5];

  useEffect(() => {
    // Auto complete after 10 seconds
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 10000);

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 100);

    return () => {
      clearTimeout(completeTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Floating Particles Background */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                  opacity: 0
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-3 shadow-2xl">
                <img 
                  src={goldiumLogo} 
                  alt="Goldium Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 font-['Orbitron'] tracking-wider mb-4"
              style={{ backgroundSize: '200% 200%' }}
            >
              GOLDIUM
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg text-white/70 mb-12 font-['Inter']"
            >
              Advanced DeFi Platform on Solana
            </motion.p>

            {/* Egg Characters */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
              className="flex justify-center items-center space-x-4 mb-8"
            >
              {eggImages.map((egg, index) => (
                <motion.div
                  key={index}
                  className="w-16 h-16"
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2 + index * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.1
                  }}
                >
                  <img 
                    src={egg} 
                    alt={`Egg ${index + 1}`} 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Loading Text and Progress */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="space-y-4"
            >
              <p className="text-yellow-400 text-lg font-['Inter'] font-medium">
                Loading DeFi Platform...
              </p>
              
              {/* Progress Dots */}
              <div className="flex justify-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    animate={{
                      backgroundColor: [
                        'rgba(156, 163, 175, 0.3)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(156, 163, 175, 0.3)'
                      ]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;