import { motion } from 'framer-motion';
import { Loader2, Brain, Search, Combine, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const stages = [
  { label: 'Analyzing...', icon: Loader2, duration: 800 },
  { label: 'Thinking...', icon: Brain, duration: 1000 },
  { label: 'Reasoning...', icon: Search, duration: 1200 },
  { label: 'Deep Research...', icon: Combine, duration: 1500 },
  { label: 'Synthesizing...', icon: Sparkles, duration: 800 },
  { label: 'Actually just waiting 4 seconds...', icon: Clock, duration: 4000 },
];

export function ProgressBar() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (currentStage >= stages.length) return;

    const stage = stages[currentStage];
    const startTime = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const stageProgress = Math.min(elapsed / stage.duration, 1);

      // Progress gets stuck at 97% unless it's the last stage
      const maxProgress = currentStage === stages.length - 1 ? 100 : 97;
      const totalProgress = ((currentStage + stageProgress) / stages.length) * maxProgress;

      setProgress(totalProgress);

      if (stageProgress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setCurrentStage(prev => prev + 1);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [currentStage]);

  useEffect(() => {
    if (progress >= 97 && progress < 100) {
      setStuck(true);
    } else if (progress >= 100) {
      setStuck(false);
    }
  }, [progress]);

  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Progress bar */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6, #8b5cf6)`,
                backgroundSize: '200% 100%',
                width: `${progress}%`,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Current stage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStage < stages.length ? (
                <>
                  <motion.div
                    animate={stuck ? { rotate: [0, 10, -10, 0] } : { rotate: 360 }}
                    transition={stuck
                      ? { duration: 0.5, repeat: Infinity }
                      : { duration: 1, repeat: Infinity, ease: 'linear' }
                    }
                  >
                    {(() => {
                      const Icon = stages[currentStage].icon;
                      return <Icon size={16} className="text-purple-400" />;
                    })()}
                  </motion.div>
                  <motion.span
                    className="text-sm text-zinc-400"
                    key={currentStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {stages[currentStage].label}
                  </motion.span>
                </>
              ) : (
                <motion.span
                  className="text-sm text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Done! (This could have been instant.)
                </motion.span>
              )}
            </div>
            <span className="text-xs text-zinc-600 font-mono">{Math.round(progress)}%</span>
          </div>

          {stuck && (
            <motion.p
              className="text-xs text-zinc-600 mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Almost there... (not really)
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
