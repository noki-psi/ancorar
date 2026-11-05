import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 34 }) => {
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
        <linearGradient id="ancorar-logo-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Outer subtle glow circle */}
      <circle cx="24" cy="24" r="22" stroke="url(#ancorar-logo-grad)" strokeWidth="1" strokeOpacity="0.25" />

      {/* Top ring / mindful breath circle */}
      <circle cx="24" cy="14" r="3.75" stroke="url(#ancorar-logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Central grounding stem */}
      <line x1="24" y1="18" x2="24" y2="35" stroke="url(#ancorar-logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Horizontal balance bar */}
      <line x1="17" y1="22" x2="31" y2="22" stroke="url(#ancorar-logo-grad)" strokeWidth="2.2" strokeLinecap="round" />
      
      {/* Fluid anchor cradle / calm ocean wave */}
      <path 
        d="M12 28C13 35.5 19 38 24 38C29 38 35 35.5 36 28" 
        stroke="url(#ancorar-logo-grad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};
