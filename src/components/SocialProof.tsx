import React, { useEffect } from 'react';
import { Card } from './shared/Card';

/**
 * SocialProof component displays embedded Bluesky posts as social proof
 * Uses the official Bluesky embed script to render posts
 */
export function SocialProof() {
  useEffect(() => {
    // Dynamically load the Bluesky embed script
    const script = document.createElement('script');
    script.src = 'https://embed.bsky.app/static/embed.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Card className="w-[95%] md:w-auto p-4 md:p-6 mt-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-100 mb-2">
            What Others Are Saying
          </h2>
          <p className="text-gray-400 text-sm">
            See what the BlueSky community thinks about BlueSpark
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Example testimonial post */}
          <blockquote 
            className="bluesky-embed" 
            data-bluesky-uri="at://did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3lce2wyzmqs2j"
            data-bluesky-cid="bafyreigx6k7ii6p74ib23qly3kvw74h3v6dtiruyfpdnppnaw5bx5m5s6y"
          />
          
          {/* Add more testimonial posts here */}
        </div>
      </div>
    </Card>
  );
}
