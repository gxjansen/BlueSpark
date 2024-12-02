import { AlertCircle } from 'lucide-react';
import { Card } from './Card';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="mt-4 text-red-400">{message}</p>
      </div>
    </Card>
  );
}
