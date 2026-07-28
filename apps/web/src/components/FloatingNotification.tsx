import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MapPin, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const locations = [
  'San Francisco',
  'Austin',
  'Miami',
  'New York',
  'Somewhere in a WeWork',
  'A coffee shop in Lisbon',
  'Their mom\'s basement',
];

const actions = [
  'optimized their workflow',
  'leveled up their productivity',
  'disrupted an industry',
  'unlocked synergy',
  'scaled their paradigm',
  'accelerated their growth',
];

export function FloatingNotification() {
  const [visible, setVisible] = useState(false);
  const [locationIndex, setLocationIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  const [dismissCount, setDismissCount] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setLocationIndex(prev => (prev + 1) % locations.length);
        setActionIndex(prev => (prev + 1) % actions.length);
        setVisible(true);
      }, 8000);
    }, 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleDismiss = () => {
    setDismissCount(prev => prev + 1);
    setVisible(false);
    // It comes back faster when dismissed
    setTimeout(() => {
      setLocationIndex(prev => (prev + 1) % locations.length);
      setActionIndex(prev => (prev + 1) % actions.length);
      setVisible(true);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-3 right-3 z-40 max-w-xs"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl">
            <div className="flex items-start gap-3">
              <motion.div
                className="text-purple-400 mt-0.5"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Bell size={18} />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-sm text-zinc-300">
                  <Sparkles size={12} className="text-yellow-400" />
                  <span className="font-medium">Someone in</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-white font-medium">
                  <MapPin size={12} className="text-red-400" />
                  <span>{locations[locationIndex]}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  just {actions[actionIndex]}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {dismissCount > 0 && (
              <motion.div
                className="mt-2 text-xs text-zinc-600 text-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {dismissCount === 1 && 'Nice try.'}
                {dismissCount === 2 && 'We\'re persistent.'}
                {dismissCount === 3 && 'Like AI.'}
                {dismissCount >= 4 && `${dismissCount} dismissals. AI always comes back.`}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
