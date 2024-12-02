import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-12">
        <Icon className="w-8 h-8 text-gray-500" />
        <p className="mt-4 text-gray-400">{message}</p>
      </div>
    </Card>
  );
}
