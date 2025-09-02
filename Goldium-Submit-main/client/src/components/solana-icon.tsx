import React from 'react';

interface SolanaIconProps {
  className?: string;
  size?: number;
}

export function SolanaIcon({ className = "", size = 16 }: SolanaIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 397.7 311.7" 
      className={className}
      fill="currentColor"
    >
      <defs>
        <linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="14%" stopColor="#8A5CF5" />
          <stop offset="32%" stopColor="#705EF5" />
          <stop offset="52%" stopColor="#4E44CE" />
          <stop offset="80%" stopColor="#14F195" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <g>
        <path 
          d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" 
          fill="url(#solana-gradient)"
        />
        <path 
          d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" 
          fill="url(#solana-gradient)"
        />
        <path 
          d="M333.1,120.1c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H275c-5.8,0-8.7-7-4.6-11.1L333.1,120.1z" 
          fill="url(#solana-gradient)"
        />
      </g>
    </svg>
  );
}