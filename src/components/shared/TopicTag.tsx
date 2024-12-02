interface TopicTagProps {
  topic: string;
  isSelected: boolean;
  onClick: (topic: string) => void;
}

export function TopicTag({ topic, isSelected, onClick }: TopicTagProps) {
  return (
    <button
      onClick={() => onClick(topic)}
      className={`
        px-3 py-1 text-sm rounded-full transition-colors
        ${isSelected 
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
          : 'bg-[#2a3441] text-gray-300 border border-[#2a3441] hover:border-blue-500/20'}
      `}
    >
      {topic}
    </button>
  );
}

interface TopicTagListProps {
  topics: string[];
  selectedTopic: string | null;
  onTopicClick: (topic: string) => void;
}

export function TopicTagList({ topics, selectedTopic, onTopicClick }: TopicTagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
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
