import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: LucideIcon;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export function Card({ 
  children, 
  title, 
  icon: Icon, 
  className = '',
  titleClassName = '',
  contentClassName = ''
}: CardProps) {
  return (
    <div className={`bg-[#242c38] rounded-lg shadow-md p-4 border border-[#2a3441] ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center mb-3">
          {Icon && <Icon className="w-5 h-5 text-blue-400" />}
          {title && (
            <h3 className={`${Icon ? 'ml-2' : ''} text-sm font-semibold text-gray-100 ${titleClassName}`}>
              {title}
            </h3>
          )}
        </div>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
