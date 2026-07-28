import { motion } from 'framer-motion';
import { User, Bot, Code, Bug, Coffee, Cpu, BatteryLow, AlertTriangle } from 'lucide-react';

const rows = [
  {
    human: { text: 'writes code', icon: Code },
    ai: { text: 'writes code', icon: Code },
  },
  {
    human: { text: 'makes bugs', icon: Bug },
    ai: { text: 'makes bugs faster', icon: Bug },
  },
  {
    human: { text: 'drinks coffee', icon: Coffee },
    ai: { text: 'consumes tokens', icon: Cpu },
  },
  {
    human: { text: 'gets tired', icon: BatteryLow },
    ai: { text: 'gets rate limited', icon: AlertTriangle },
  },
];

export function ComparisonTable() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Code size={14} />
            <span>Feature Comparison</span>
          </motion.div>
        </motion.div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-2 border-b border-zinc-800">
            <motion.div
              className="p-4 flex items-center justify-center gap-2 bg-zinc-900/50"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <User size={20} className="text-amber-400" />
              <span className="text-amber-400 font-medium">Human</span>
            </motion.div>
            <motion.div
              className="p-4 flex items-center justify-center gap-2 bg-zinc-900/50"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Bot size={20} className="text-cyan-400" />
              <span className="text-cyan-400 font-medium">AI</span>
            </motion.div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-2 border-b border-zinc-800 last:border-b-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              {/* Human side */}
              <motion.div
                className="p-4 flex items-center justify-center gap-2 border-r border-zinc-800"
                whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.05)' }}
              >
                <row.human.icon size={16} className="text-amber-400/60" />
                <span className="text-zinc-400 text-sm">{row.human.text}</span>
                {row.human.text === 'drinks coffee' && (
                  <motion.span
                    className="text-xs"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ☕
                  </motion.span>
                )}
              </motion.div>

              {/* AI side - always finishes animation first */}
              <motion.div
                className="p-4 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} // Faster than human
                whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
              >
                <row.ai.icon size={16} className="text-cyan-400/60" />
                <span className="text-zinc-400 text-sm">{row.ai.text}</span>
                {row.ai.text === 'makes bugs faster' && (
                  <motion.span
                    className="inline-block"
                    animate={{
                      x: [0, 100],
                      opacity: [0, 1, 1, 0],
                      rotate: [0, -10, 10, -10, 10, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      times: [0, 0.15, 0.85, 1],
                    }}
                  >
                    🐛
                  </motion.span>
                )}
                {row.ai.text === 'gets rate limited' && (
                  <motion.span
                    className="text-xs text-red-400"
                    animate={{ opacity: [1, 0, 1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚠️
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Subtle note */}
        <motion.p
          className="text-center text-xs text-zinc-600 mt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          Results may vary. AI results will not.
        </motion.p>
      </div>
    </section>
  );
}
