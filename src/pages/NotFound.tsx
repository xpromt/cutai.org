import { motion } from 'framer-motion';
import { FileQuestion, Scan, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const messages = [
  'The page you\'re looking for has been vectorized.',
  'Converting to embeddings...',
  'Semantic search returned no results.',
  'This URL has been hallucinated.',
];

export function NotFound() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [pixelated, setPixelated] = useState(false);

  useEffect(() => {
    setPixelated(true);
    const timer = setTimeout(() => {
      setMessageIndex(1);
      setTimeout(() => {
        setMessageIndex(2);
        setTimeout(() => setMessageIndex(3), 1500);
      }, 1500);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Pixelation effect */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            filter: pixelated ? 'url(#pixelate)' : 'none',
          }}
        >
          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <FileQuestion size={64} className="text-zinc-600" />
            <motion.div
              className="text-8xl font-bold text-zinc-700"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Typewriter messages */}
        <div className="h-16 mb-8">
          {messages.map((msg, i) => (
            <motion.p
              key={i}
              className="text-zinc-400 absolute left-0 right-0"
              initial={{ opacity: 0, y: 10 }}
              animate={messageIndex >= i ? { opacity: messageIndex === i ? 1 : 0.3, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              {msg}
            </motion.p>
          ))}
        </div>

        {/* Scan animation */}
        <motion.div
          className="flex items-center justify-center gap-2 text-zinc-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Scan size={16} />
          </motion.div>
          <span className="text-sm">Scanning vector space...</span>
        </motion.div>

        <Link to="/">
          <motion.button
            className="px-6 py-3 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Return to reality
            </span>
          </motion.button>
        </Link>
      </div>

      {/* SVG filter for pixelation */}
      <svg className="hidden">
        <defs>
          <filter id="pixelate">
            <feFlood x="4" y="4" height="2" width="2" />
            <feComposite width="10" height="10" />
            <feTile result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
            <feMorphology operator="dilate" radius="5" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
