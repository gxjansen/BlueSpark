import React from 'react';
import { Loader } from 'lucide-react';
import { Card } from './Card';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = 'Loading...', 
  className = '' 
}: LoadingStateProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col items-center justify-center py-8">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="mt-4 text-gray-400">{message}</p>
      </div>
    </Card>
  );
}
