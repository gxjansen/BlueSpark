import React from 'react';
import { useStore } from '../lib/store';
import { Activity, Zap } from 'lucide-react';

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
          <span className="text-gray-300">{apiStats.blueskyApiCalls}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-1 text-blue-400" />
            <span className="text-gray-400">AI tokens used:</span>
          </div>
          <span className="text-gray-300">{apiStats.openRouterTokens}</span>
        </div>
      </div>
    </div>
  );
}
