import { motion } from 'framer-motion';
import { Code2, ArrowRight, RotateCcw } from 'lucide-react';

const migrations = [
  { name: 'React', icon: '⚛️' },
  { name: 'Next.js', icon: '▲' },
  { name: 'Vite', icon: '⚡' },
  { name: 'Astro', icon: '🚀' },
  { name: 'Rust', icon: '🦀' },
];

export function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-zinc-500 mb-6">Made with React.</p>

          {/* Migration timeline */}
          <motion.div
            className="flex items-center justify-center gap-2 flex-wrap mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {migrations.map((m, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <span className="text-sm text-zinc-400">
                  {i === 0 ? 'Made with' : 'Then migrated to'} {m.name}
                </span>
                <span>{m.icon}</span>
                {i < migrations.length - 1 && (
                  <ArrowRight size={14} className="text-zinc-600" />
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="text-zinc-600 text-sm flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            <RotateCcw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
            Then another AI rewrote it in Rust.
          </motion.p>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-zinc-800/50 text-xs text-zinc-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Code2 size={14} />
            <span>cutai.org</span>
          </div>
          <div className="flex items-center gap-4">
            <span>No AI was harmed in the making of this page.</span>
            <span>Humans were.</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
