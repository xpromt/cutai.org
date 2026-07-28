import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Bot, CheckCircle, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [crumbleLevel, setCrumbleLevel] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCrumbleLevel(prev => Math.min(prev + 1, 5));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleAccept = () => {
    setProcessing(true);
    setTimeout(() => {
      setAccepted(true);
      setTimeout(() => {
        setVisible(false);
        // It comes back
        setTimeout(() => {
          setAccepted(false);
          setProcessing(false);
          setVisible(true);
        }, 10000);
      }, 2000);
    }, 1500);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-3 left-3 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="max-w-xs p-2.5 rounded-lg bg-zinc-900/80 backdrop-blur border border-zinc-700 shadow-2xl">
          <div className="flex items-center gap-2">
            <motion.div
              className="text-orange-400 shrink-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Cookie size={16} style={{ clipPath: `inset(0 ${crumbleLevel * 15}% 0 0)` }} />
            </motion.div>
            <div className="text-[12px] leading-tight text-zinc-400 flex-1">
              <p>
                We use cookies. <Bot size={10} className="inline text-zinc-500" /> AI too.
              </p>
            </div>

            <div className="flex items-center shrink-0">
              {!accepted ? (
                <motion.button
                  className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white text-[11px] font-medium cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center gap-1">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles size={10} />
                      </motion.div>
                      Accepting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={10} />
                      Accept
                    </span>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  className="text-[11px] text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Accepted. Forever.
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
