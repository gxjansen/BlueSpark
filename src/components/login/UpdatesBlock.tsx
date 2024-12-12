import React from 'react';
import { Card } from '../shared/Card';
import { Sparkles, MessageSquare, Users, PenLine, GitPullRequestCreateArrow } from 'lucide-react';

interface Update {
  title: string;
  description: string; // This will now contain HTML
  date: string;
  icon: React.ReactNode;
}

const updates: Update[] = [
  {
    title: 'Message generation updates', 
    description: `
      <ul class="list-disc pl-5">
        <li><strong>NEW:</strong> Emoji level (Off / Low / High)</li>
        <li><strong>NEW:</strong> You can now hide followers from the list for better organization</li>
        <li><strong>IMPROVED:</strong> adherence to the "Tone of voice" you set. These now make a bigger difference</li>
        <li><strong>FIXED:</strong> @-mentions when regenerating a message or when refining a message with a shared interest</li>
        <li><strong>FIXED:</strong> the "Additional Instruction" are now actually taken into account 😅</li>
      </ul>
    `,
    date: 'December 12th, 2024',
    icon: <PenLine className="w-5 h-5 text-blue-400" />,
  },
  {
    title: 'Beta Launch',
    description: '🚀 BlueSpark is now available for beta testing!',
    date: 'December 2nd, 2024',
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
  },
];

export function UpdatesBlock() {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitPullRequestCreateArrow className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">Latest Updates</h2>
      </div>

      <div className="space-y-6">
        {updates.map((update, index) => (
          <div 
            key={index}
            className={`flex gap-4 ${
              index !== updates.length - 1 ? 'pb-6 border-b border-[#3b4758]' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {update.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-100">{update.title}</h3>
                <span className="text-sm text-gray-400">{update.date}</span>
              </div>
              {/* Render description as HTML */}
              <div className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: update.description }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
