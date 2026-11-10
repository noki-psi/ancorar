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
      aria-label="Logo AncorAR"
    >
      <defs>
        <linearGradient id="ancorar-wind-grad" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Gentle zen aura circle */}
      <circle cx="24" cy="24" r="21" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.25" />
      <circle cx="24" cy="24" r="21" stroke="url(#ancorar-wind-grad)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

      {/* Wind breath paths (flowing organic breeze) */}
      <path 
        d="M9 19H31C34.3137 19 37 16.3137 37 13C37 9.68629 34.3137 7 31 7C28.5 7 26.5 8.5 25.5 10.5" 
        stroke="url(#ancorar-wind-grad)" 
        strokeWidth="2.75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M7 26H35C38.3137 26 41 28.6863 41 32C41 35.3137 38.3137 38 35 38C32 38 29.5 35.5 29.5 32.5" 
        stroke="url(#ancorar-wind-grad)" 
        strokeWidth="2.75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M12 33H22C24.2091 33 26 31.2091 26 29C26 26.7909 24.2091 25 22 25" 
        stroke="url(#ancorar-wind-grad)" 
        strokeWidth="2.75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default Logo;
