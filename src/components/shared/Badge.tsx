interface BadgeProps {
  text: string;
  variant?: 'default' | 'blue' | 'green';
  className?: string;
}

export function Badge({ text, variant = 'default', className = '' }: BadgeProps) {
  const style = {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: variant === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 
                    variant === 'green' ? 'rgba(34, 197, 94, 0.1)' : 
                    'rgba(107, 114, 128, 0.1)',
    color: variant === 'blue' ? '#60a5fa' : 
           variant === 'green' ? '#4ade80' : 
           '#9ca3af',
    border: '1px solid',
    borderColor: variant === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
                variant === 'green' ? 'rgba(34, 197, 94, 0.2)' : 
                'rgba(107, 114, 128, 0.2)'
  };

  return (
    <span style={style} className={className}>
      {text}
    </span>
  );
}
