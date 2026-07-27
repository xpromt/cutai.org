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
        className="fixed top-0 left-0 right-0 z-50 p-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="max-w-4xl mx-auto p-4 rounded-xl bg-zinc-900/70 backdrop-blur border border-zinc-700 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                className="text-orange-400"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cookie size={24} style={{ clipPath: `inset(0 ${crumbleLevel * 15}% 0 0)` }} />
              </motion.div>
              <div className="text-sm text-zinc-400">
                <p>
                  We use cookies. <Bot size={14} className="inline text-zinc-500" /> AI also uses cookies.
                </p>
                <p className="text-zinc-600">Everything uses cookies.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!accepted ? (
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles size={14} />
                      </motion.div>
                      Processing your acceptance...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      Accept All Intelligence
                    </span>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  className="text-sm text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Cookies accepted. We'll remember this. Forever.
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
