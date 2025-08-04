// components/LogoJungle.tsx
import React from 'react';

interface LogoJungleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
  onClick?: () => void;
}

export const LogoJungle: React.FC<LogoJungleProps> = ({ 
  size = 'md', 
  className = '', 
  withText = false,
  onClick 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  return (
    <div 
      className={`flex justify-center ${withText ? 'items-center space-x-2' : ''} ${className}`}
      onClick={onClick}
    >
      <img 
        src="/Jungle_logo05.png" 
        alt="Jungle Marketplace" 
        className={`${sizeClasses[size]} w-auto object-contain ${onClick ? 'cursor-pointer' : ''}`}
      />
      {withText && (
        <span className="text-xl font-bold text-gray-800">Jungle</span>
      )}
    </div>
  );
};