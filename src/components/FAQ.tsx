import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Frown, Pen, BarChart2, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Is this AI?',
    answer: 'Unfortunately.',
    icon: Frown,
    color: 'text-red-400',
  },
  {
    question: 'Who wrote this?',
    answer: 'Another AI.',
    icon: Pen,
    color: 'text-purple-400',
  },
  {
    question: 'Is this satire?',
    answer: 'Our confidence score is [NAN].',
    icon: BarChart2,
    color: 'text-blue-400',
    hasGlitch: true,
  },
  {
    question: 'Is there a waitlist?',
    answer: 'There is always a waitlist.',
    icon: Clock,
    color: 'text-orange-400',
    hasCounter: true,
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const waitlistCount = 1247;

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <HelpCircle size={14} />
            <span>FAQ</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="border border-zinc-800 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.button
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-zinc-900/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                whileHover={{ x: 5 }}
              >
                <span className="text-white font-medium">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} className="text-zinc-500" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 flex items-start gap-3">
                      <faq.icon size={20} className={faq.color} />
                      <div>
                        <p className="text-zinc-400">{faq.answer}</p>

                        {faq.hasGlitch && (
                          <motion.div
                            className="mt-2 text-sm text-zinc-600"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.5, repeat: 3 }}
                          >
                            Confidence: 94%... 0.3%... 15%... 4%
                          </motion.div>
                        )}

                        {faq.hasCounter && (
                          <motion.div
                            className="mt-2 flex items-center gap-2 text-sm text-zinc-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Sparkles size={12} />
                            <span>Current waitlist: {waitlistCount.toLocaleString()} people ahead of you</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
