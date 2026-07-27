import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const buzzwords = [
  'Agentic',
  'Autonomous',
  'Cognitive',
  'Adaptive',
  'Context-Aware',
  'Multi-Modal',
  'Enterprise',
  'Next-Gen',
  'Semantic',
  'Quantum',
];

interface BuzzwordTextProps {
  children: string;
  className?: string;
}

export function BuzzwordText({ children, className = '' }: BuzzwordTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(children);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(children);
      setShowSparkle(false);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(buzzwords[index % buzzwords.length]);
      setShowSparkle(true);
      index++;
    }, 150);

    return () => clearInterval(interval);
  }, [isHovered, children]);

  return (
    <motion.span
      className={`relative inline-block cursor-pointer ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      {displayText}
      {showSparkle && (
        <motion.span
          className="absolute -top-2 -right-4 text-yellow-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <Sparkles size={12} />
        </motion.span>
      )}
    </motion.span>
  );
}
