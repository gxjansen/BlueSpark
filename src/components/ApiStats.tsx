import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { useStore } from '../lib/store';

export function ApiStats() {
  const { apiStats } = useStore();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">API Usage</h3>
      
      <div className="space-y-3">
        {/* BlueSky API Calls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">BlueSky API Calls</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {apiStats.blueskyApiCalls.toLocaleString()}
          </span>
        </div>

        {/* OpenRouter Tokens */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">OpenRouter Tokens</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {apiStats.openRouterTokens.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Stats since last login
      </div>
    </div>
  );
}
