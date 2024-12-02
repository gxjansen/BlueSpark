import React from 'react';

interface TopicTagProps {
  topic: string;
  isSelected?: boolean;
  onClick?: (topic: string) => void;
  className?: string;
}

export function TopicTag({ 
  topic, 
  isSelected = false, 
  onClick,
  className = ''
}: TopicTagProps) {
  const baseStyles = "px-2 py-1 text-xs rounded-full transition-colors";
  const selectedStyles = "bg-blue-500/20 text-blue-400";
  const unselectedStyles = "bg-[#2a3441] text-gray-300 hover:bg-[#323e4e]";

  return (
    <button
      onClick={() => onClick?.(topic)}
      className={`
        ${baseStyles}
        ${isSelected ? selectedStyles : unselectedStyles}
        ${className}
      `}
    >
      {topic}
    </button>
  );
}

interface TopicTagListProps {
  topics: string[];
  selectedTopic?: string | null;
  onTopicClick?: (topic: string) => void;
  className?: string;
}

export function TopicTagList({
  topics,
  selectedTopic,
  onTopicClick,
  className = ''
}: TopicTagListProps) {
  if (!topics.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {topics.map((topic) => (
        <TopicTag
          key={topic}
          topic={topic}
          isSelected={topic === selectedTopic}
          onClick={onTopicClick}
        />
      ))}
    </div>
  );
}
