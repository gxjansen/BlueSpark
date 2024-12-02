import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon, 
  message, 
  className = '',
  action
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col items-center justify-center py-8">
        <Icon className="w-8 h-8 text-gray-500" />
        <p className="mt-4 text-gray-400">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300"
          >
            {action.label}
          </button>
        )}
      </div>
    </Card>
  );
}
