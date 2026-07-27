import { motion } from 'framer-motion';
import { Pen, CheckSquare, Sparkles, Loader2, PartyPopper } from 'lucide-react';
import { useState } from 'react';

const items = [
  { text: 'em dashes—', icon: '—' },
  { text: '"In today\'s rapidly evolving landscape..."', icon: '💬' },
  { text: '"Unlock"', icon: '🔓' },
  { text: '"Seamlessly"', icon: '✨' },
  { text: '"Leverage"', icon: '📈' },
  { text: 'glowing gradients', icon: '🌈' },
  { text: 'floating cards', icon: '🃏' },
  { text: 'productivity dashboards', icon: '📊' },
  { text: 'glassmorphism', icon: '🪟' },
  { text: '"Transform your workflow"', icon: '⚡' },
];

export function Petition() {
  const [signed, setSigned] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(items.length).fill(false));
  const [showSummary, setShowSummary] = useState(false);

  const handleSign = () => {
    setSigned(true);
    // Animate checkboxes one by one
    items.forEach((_, i) => {
      setTimeout(() => {
        setCheckedItems(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 200);
    });
    // Show summary after all checked
    setTimeout(() => setShowSummary(true), items.length * 200 + 1000);
  };

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Pen size={14} />
            <span>Petition</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">Sign the Petition</h2>
          <p className="text-zinc-400">We demand AI stop generating:</p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <motion.div
                animate={checkedItems[i] ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <CheckSquare
                  size={20}
                  className={checkedItems[i] ? 'text-green-400' : 'text-zinc-600'}
                />
              </motion.div>
              <span className={checkedItems[i] ? 'text-zinc-300 line-through' : 'text-zinc-400'}>
                {item.text}
              </span>
              <span className="ml-auto text-lg">{item.icon}</span>
            </motion.div>
          ))}
        </div>

        {!signed ? (
          <motion.button
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-semibold text-lg cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSign}
          >
            <span className="flex items-center justify-center gap-2">
              <Pen size={20} />
              Sign the Petition
            </span>
          </motion.button>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {!showSummary ? (
              <div className="flex items-center justify-center gap-3 text-zinc-400">
                <Loader2 size={20} className="animate-spin" />
                <span>Summarizing your signature...</span>
              </div>
            ) : (
              <motion.div
                className="p-6 rounded-xl glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PartyPopper className="text-yellow-400 mx-auto mb-4" size={32} />
                <p className="text-zinc-300 mb-4">Thank you.</p>
                <p className="text-zinc-500 text-sm">
                  Your signature has been summarized by AI into four bullet points:
                </p>
                <ul className="mt-4 space-y-2 text-left max-w-sm mx-auto text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Sparkles size={12} className="text-purple-400" />
                    Concerned stakeholder expresses sentiment
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={12} className="text-purple-400" />
                    Strong opinion detected (confidence: 94%)
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={12} className="text-purple-400" />
                    Action item: continue existing behavior
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={12} className="text-purple-400" />
                    Summary generated by the very thing being protested
                  </li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
