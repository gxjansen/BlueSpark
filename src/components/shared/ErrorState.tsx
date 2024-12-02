import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from './Card';

interface ErrorStateProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message, 
  className = '',
  onRetry 
}: ErrorStateProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="mt-4 text-gray-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Try Again
          </button>
        )}
      </div>
    </Card>
  );
}
