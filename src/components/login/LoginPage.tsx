import React from 'react';
import { Card } from '../shared/Card';
import { LoginHeader } from './LoginHeader';
import { LoginFormFields } from './LoginFormFields';
import { HowItWorks } from './HowItWorks';
import { SocialProof } from '../SocialProof';
import { UpdatesBlock } from './UpdatesBlock';
import { RoadmapBlock } from './RoadmapBlock';

export function LoginPage() {
  return (
    <div className="space-y-6 w-[95%] md:w-auto mx-auto max-w-5xl">
      {/* Main Login Card */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Logo and Login Form */}
          <div className="flex flex-col">
            <LoginHeader />
            <LoginFormFields />
          </div>

          {/* Right Column - Features and Description */}
          <HowItWorks />
        </div>
      </Card>

      {/* Updates and Roadmap Section */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
        <UpdatesBlock />
        <RoadmapBlock />
      </div>

      {/* Social Proof Section */}
      <SocialProof />
    </div>
  );
}
