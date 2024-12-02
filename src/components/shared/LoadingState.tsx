import { Loader } from 'lucide-react';
import { Card } from './Card';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="mt-4 text-gray-400">{message}</p>
      </div>
    </Card>
  );
}
