import React from 'react';

export function HowItWorks() {
  return (
    <div className="space-y-5 md:space-y-6 text-gray-300 md:border-l md:border-[#3b4758] md:pl-8 pt-6 md:pt-0 border-t border-[#3b4758] md:border-t-0">
      <p className="text-sm md:text-base">
        Welcome each new follower with a personal icebreaking message. By finding what you have in common, it helps you start discussions that both of you will enjoy – turning simple follows into real connections on BlueSky.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">How it works</h2>
        <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
          <li className="flex items-start">
            <span className="mr-3 text-xl">1️⃣</span>
            <span>Login with your BlueSky credentials and automatically detect new followers.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-xl">2️⃣</span>
            <span>Use AI to scan profiles & latest messages to find common interests and topics.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-xl">3️⃣</span>
            <span>Generate a personalized message, customize it and post it!</span>
          </li>
        </ul>
      </div>

      <div className="pt-4 border-t border-[#3b4758] text-sm md:text-base">
        <p className="text-gray-300">It's that simple!</p>
        <p className="mt-2">
          And no worries, we <strong>never post anything automatically</strong>, only when you click the "Post" button.
        </p>
      </div>
    </div>
  );
}
