import React from 'react';
import { useStore } from '../lib/store';
import { Activity } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export function ApiStats() {
  const { apiStats } = useStore();

  return (
    <div className="bg-[#242c38] rounded-lg shadow-md p-4 border border-[#2a3441]">
      <div className="flex items-center mb-3">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="ml-2 text-sm font-semibold text-gray-100">API Usage</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">BlueSky API calls:</span>
          <span className="text-gray-300 tabular-nums">
            {numberFormatter.format(apiStats.blueskyApiCalls)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">AI tokens used:</span>
          <span className="text-gray-300 tabular-nums">
            {numberFormatter.format(apiStats.openRouterTokens)}
          </span>
        </div>
      </div>
    </div>
  );
}
