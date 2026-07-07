import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crown, Building2, Check, Phone, DollarSign, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

const tiers = [
  {
    name: 'Starter',
    price: 'Free*',
    note: '*after entering your email.',
    icon: Zap,
    color: 'text-zinc-400',
    borderColor: 'border-zinc-700',
    features: ['Basic AI', 'Basic dashboard', 'Basic confidence'],
    recommended: false,
  },
  {
    name: 'Pro',
    price: '$29/mo',
    note: 'Includes',
    icon: Crown,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    features: ['3x more AI', '7x more dashboards', '14x more confidence', 'same output'],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Sales',
    note: 'Nobody ever does.',
    icon: Building2,
    color: 'text-zinc-400',
    borderColor: 'border-zinc-700',
    features: ['Everything in Pro', 'A phone call', 'PowerPoint deck', 'Vague ROI claims'],
    recommended: false,
  },
];

export function Pricing() {
  const [contactOpen, setContactOpen] = useState(false);

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <DollarSign size={14} />
            <span>Pricing</span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              className={`relative p-6 rounded-xl border ${tier.borderColor} bg-zinc-900/50 ${
                tier.recommended ? 'md:-mt-4 md:mb-4 ring-2 ring-yellow-500/30' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -5 }}
            >
              {tier.recommended && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  MOST POPULAR
                </motion.div>
              )}

              <motion.div
                className={`${tier.color} mb-4`}
                animate={tier.recommended ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <tier.icon size={32} />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>

              <div className="mb-4">
                <span className="text-3xl font-bold text-white">{tier.price}</span>
                {tier.note && (
                  <p className="text-sm text-zinc-500 mt-1">{tier.note}</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, j) => (
                  <motion.li
                    key={j}
                    className="flex items-center gap-2 text-sm text-zinc-400"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + j * 0.1 }}
                  >
                    <Check size={16} className="text-green-400" />
                    <span className={feature === 'same output' ? 'text-zinc-600 line-through' : ''}>
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {tier.name === 'Enterprise' ? (
                <motion.button
                  className="w-full py-3 rounded-lg border border-zinc-700 text-zinc-300 font-medium cursor-pointer hover:bg-zinc-800 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setContactOpen(true)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Phone size={16} />
                    Contact Sales
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  className={`w-full py-3 rounded-lg font-medium cursor-pointer transition-colors ${
                    tier.recommended
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Sales modal */}
        <AnimatePresence>
          {contactOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContactOpen(false)}
            >
              <motion.div
                className="w-full max-w-md p-6 rounded-xl bg-zinc-900 border border-zinc-700"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Contact Sales</h3>
                  <button onClick={() => setContactOpen(false)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
                <div className="text-center py-8">
                  <Phone className="text-zinc-600 mx-auto mb-4" size={48} />
                  <p className="text-zinc-400 mb-2">All our sales agents are currently busy.</p>
                  <p className="text-zinc-600 text-sm">They're probably using AI to write emails.</p>
                  <motion.div
                    className="mt-4 flex items-center justify-center gap-2 text-zinc-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles size={14} />
                    <span className="text-sm">Estimated wait: ∞</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
