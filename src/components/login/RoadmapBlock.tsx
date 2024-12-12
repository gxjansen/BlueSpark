import React from 'react';
import { Card } from '../shared/Card';
import { Sparkles, MessageSquare, Users, Star, ExternalLink, GitPullRequestDraftIcon, Lightbulb } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const roadmapItems: RoadmapItem[] = [
  {
    title: 'Direct Messages',
    description: 'Instead of posting your welcome message on your timeline, you can choose to send it as a direct message.',
    icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
  },
];

export function RoadmapBlock() {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitPullRequestDraftIcon className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">Coming Soon</h2>
      </div>

      <div className="space-y-6">
        {roadmapItems.map((item, index) => (
          <div 
            key={index}
            className={`flex gap-4 ${
              index !== roadmapItems.length - 1 ? 'pb-6 border-b border-[#3b4758]' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {item.icon}
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-100">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#3b4758]">
        <a
          href="https://github.com/gxjansen/BlueSpark/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <Lightbulb className="w-4 h-4" />
          <span>Suggest a feature on GitHub</span>
        </a>
      </div>
    </Card>
  );
}
