import React from 'react';

export function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-6 md:mb-8">
      <div className="flex items-center mb-4">
        <img 
          src="/logo-blue.svg" 
          alt="BlueSpark Logo" 
          className="w-10 h-10 md:w-12 md:h-12 mr-3 md:mr-4"
        />
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">BlueSpark</h1>
          <span className="font-['Caveat'] text-blue-400 -rotate-6 text-xl md:text-2xl">Beta</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm italic text-center">
        Starting a conversation can be hard.<br/>
        Use BlueSpark to help break the ice!
      </p>
    </div>
  );
}
