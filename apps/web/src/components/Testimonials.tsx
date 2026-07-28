import { motion } from 'framer-motion';
import { Star, Bot, Brain, MessageSquare, Quote, BadgeCheck } from 'lucide-react';

const testimonials = [
  {
    quote: '"This fundamentally transformed our paradigm."',
    author: 'ChatGPT',
    icon: Bot,
    color: 'text-green-400',
  },
  {
    quote: '"Finally a solution that leverages next-generation autonomous intelligence."',
    author: 'Claude',
    icon: Brain,
    color: 'text-purple-400',
  },
  {
    quote: '"As an AI language model..."',
    author: 'Every AI',
    icon: MessageSquare,
    color: 'text-blue-400',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Star size={14} />
            <span>Testimonials</span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="relative p-6 rounded-xl border border-zinc-800 bg-zinc-900/50"
              initial={{ opacity: 0, y: 30, rotate: i === 0 ? -3 : i === 2 ? 3 : 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: 'spring' }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 + j * 0.1 }}
                  >
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </div>

              {/* Quote */}
              <motion.div
                className="relative mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 + 0.5 }}
              >
                <Quote size={24} className="absolute -top-2 -left-1 text-zinc-700" />
                <p className="text-zinc-300 italic pl-6">{t.quote}</p>
              </motion.div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <motion.div
                  className={`${t.color} p-2 rounded-lg bg-zinc-800`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i }}
                >
                  <t.icon size={20} />
                </motion.div>
                <div>
                  <p className="text-white font-medium">{t.author}</p>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <BadgeCheck size={12} className="text-blue-400" />
                    <span>Verified AI</span>
                  </div>
                </div>
              </div>

              {/* Floating sparkle */}
              <motion.div
                className="absolute -top-2 -right-2 text-yellow-400/30"
                animate={{ y: [0, -5, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✦
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Auto-scrolling ticker */}
        <motion.div
          className="mt-12 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-8">
                {['"Game-changing"', '"Revolutionary"', '"Disruptive"', '"Paradigm shift"', '"Synergy"', '"10x developer"'].map((text, i) => (
                  <span key={i} className="text-zinc-600 text-sm">
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
