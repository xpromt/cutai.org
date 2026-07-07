import { motion } from 'framer-motion';
import {
  Brain,
  Building2,
  Workflow,
  Cpu,
  Database,
  UserCheck,
  Zap,
  Rocket,
  Check,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered™',
    description: "Because regular software wasn't enough.",
    color: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20',
    animation: { scale: [1, 1.1, 1] },
  },
  {
    icon: Building2,
    title: 'Enterprise Ready™',
    description: 'Nobody knows what that means.',
    color: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
    animation: {},
  },
  {
    icon: Workflow,
    title: 'Agentic Workflow™',
    description: 'Several LLM calls pretending to be coworkers.',
    color: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
    animation: {},
  },
  {
    icon: Cpu,
    title: 'Context Engineering™',
    description: 'Prompting with extra steps.',
    color: 'text-green-400',
    glow: 'group-hover:shadow-green-500/20',
    animation: {},
  },
  {
    icon: Database,
    title: 'Memory Layer™',
    description: 'We cached your mistakes.',
    color: 'text-orange-400',
    glow: 'group-hover:shadow-orange-500/20',
    animation: {},
  },
  {
    icon: UserCheck,
    title: 'Human-in-the-loop',
    description: 'We made Dave click "Approve."',
    color: 'text-pink-400',
    glow: 'group-hover:shadow-pink-500/20',
    animation: {},
  },
  {
    icon: Zap,
    title: 'Autonomous',
    description: 'Until the API rate limit.',
    color: 'text-yellow-400',
    glow: 'group-hover:shadow-yellow-500/20',
    animation: {},
  },
  {
    icon: Rocket,
    title: 'Infinite Scale',
    description: 'Pending funding.',
    color: 'text-red-400',
    glow: 'group-hover:shadow-red-500/20',
    animation: { y: [0, -20, -40, -60, -80] },
  },
];

export function AIFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={14} />
            <span>Typical AI Features™</span>
          </motion.div>
          <p className="text-zinc-500">Every card uses Lucide icons.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className={`group relative p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm cursor-pointer transition-all duration-300 ${feature.glow} hover:shadow-lg`}
              initial={{ opacity: 0, y: 20, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <motion.div
                className={`${feature.color} mb-4`}
                animate={hoveredIndex === i ? { rotate: 360 } : {}}
                transition={{ duration: 0.5 }}
              >
                <feature.icon size={32} />
              </motion.div>

              <h3 className="text-white font-semibold mb-2 flex items-center gap-1">
                {feature.title}
                <motion.span
                  className="text-xs text-zinc-600"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                >
                  ™
                </motion.span>
              </h3>

              <p className="text-zinc-400 text-sm">{feature.description}</p>

              <motion.div
                className="absolute top-3 right-3 text-green-500"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}
              >
                <Check size={16} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
