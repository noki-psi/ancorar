import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Ancorar"
    >
      <defs>
        <linearGradient id="ancorar-organic" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a3c9b8" />
          <stop offset="60%" stopColor="#7fae9b" />
          <stop offset="100%" stopColor="#e5d7b5" />
        </linearGradient>
      </defs>

      {/* Organic outer calming circle */}
      <circle cx="24" cy="24" r="21" stroke="#11222d" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="21" stroke="url(#ancorar-organic)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

      {/* Zen top mindful ring */}
      <circle cx="24" cy="14" r="3.5" stroke="url(#ancorar-organic)" strokeWidth="2.2" strokeLinecap="round" />
      
      {/* Central grounded anchor stem */}
      <line x1="24" y1="18" x2="24" y2="34" stroke="url(#ancorar-organic)" strokeWidth="2.2" strokeLinecap="round" />
      
      {/* Horizontal balance bar */}
      <line x1="17" y1="22" x2="31" y2="22" stroke="url(#ancorar-organic)" strokeWidth="2" strokeLinecap="round" />
      
      {/* Smooth calming wave base */}
      <path 
        d="M13 28C14 34.5 19 37 24 37C29 37 34 34.5 35 28" 
        stroke="url(#ancorar-organic)" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};
