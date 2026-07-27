import { motion } from 'framer-motion';
import { Eye, Sparkles, HandMetal } from 'lucide-react';

export function PlotTwist() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Dramatic reveal */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm mb-6"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Eye size={14} />
              <span>Plot twist</span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              This page contains{' '}
              <motion.span
                className="text-gradient-animated"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.5)',
                    '0 0 40px rgba(236, 72, 153, 0.5)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                zero AI
              </motion.span>
              .
            </motion.h2>
          </motion.div>

          <motion.p
            className="text-zinc-400 text-lg mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            Every cliché was handcrafted by a human after spending too much time on Product Hunt and X.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-2 text-zinc-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 }}
          >
            <HandMetal size={16} />
            <span className="text-sm">No language models were consulted. Just vibes.</span>
          </motion.div>

          {/* Confetti-like sparkles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400/20 pointer-events-none"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <Sparkles size={12 + Math.random() * 12} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
