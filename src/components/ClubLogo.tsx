import React from 'react';

interface ClubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  alt?: string;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({ 
  className = '', 
  size = 'md',
  alt = 'BD Power Strikers Football Club Crest' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    hero: 'w-28 h-28 sm:w-36 sm:h-36'
  };

  const selectedSize = className.includes('w-') ? '' : sizeClasses[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${selectedSize} ${className}`}>
      <img 
        src="/logo.svg" 
        alt={alt}
        className="w-full h-full object-contain rounded-full drop-shadow-[0_2px_8px_rgba(217,119,6,0.3)] transition-transform duration-300 hover:scale-105"
        loading="eager"
      />
    </div>
  );
};

export default ClubLogo;
