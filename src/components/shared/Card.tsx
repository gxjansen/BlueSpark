import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[#242c38] rounded-lg shadow-md p-6 border border-[#2a3441] ${className}`}
    >
      {children}
    </div>
  );
}
