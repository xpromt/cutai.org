import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Gamepad2, Send, Loader2, CheckCircle, Sparkles, MessageSquare } from 'lucide-react';

export function ContactAndPromo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'seed',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingTexts = [
    'Evaluating synergy parameters...',
    'Filtering out prompt-injection attempts...',
    'Forwarding to simulated trash folder...',
    'Routing notification to Dave\'s Apple Watch...',
  ];

  useEffect(() => {
    let interval: any;
    if (status === 'submitting') {
      interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= loadingTexts.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStatus('submitted'), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoadingStep(0);
    setStatus('submitting');

    try {
      await fetch('https://formspree.io/f/mojoplpe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          message: formData.message,
          _subject: `[CutAI] ${formData.topic} — from ${formData.name}`,
        }),
      });
    } catch {}

    setTimeout(() => setStatus('submitted'), 2500);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', topic: 'seed', message: '' });
    setStatus('idle');
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 text-pink-400 text-sm mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <MessageSquare size={14} />
            <span>Synergy & Promotion</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Commercial Outlets & Fun Blocks
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Monetization mandates forced us to put a game link here, and our legal advisor insisted on a channel to ignore feedback.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* NeuralCute Game Promo Card */}
          <motion.div
            className="flex flex-col justify-between p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            {/* Subtle glow border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <Gamepad2 size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono border border-zinc-800 px-2 py-0.5 rounded-full">
                  Sponsored Synergy
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                NeuralCute.cutai.org
                <Sparkles size={16} className="text-pink-400 animate-pulse" />
              </h3>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Tired of waiting for AI agents to write your code? Play a game built entirely by human cognitive efforts (supposedly).
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="text-pink-400">✓</span> Zero hallucinated graphics
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="text-pink-400">✓</span> 100% natural, hand-crafted gameplay loop
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="text-pink-400">✓</span> Statistically guaranteed to waste 10 minutes
                </div>
              </div>
            </div>

            <div>
              <motion.a
                href="https://neuralcute.cutai.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch Game
                <Gamepad2 size={16} />
              </motion.a>
              <p className="text-[10px] text-zinc-600 text-center mt-3 font-mono">
                Clicking will open a portal to pre-AGI amusement.
              </p>
            </div>
          </motion.div>

          {/* Contact / Suggestion Form Card */}
          <motion.div
            className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-500 flex flex-col justify-between"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4 flex flex-col justify-between h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-400 font-mono mb-1">Your Identity</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Human / Prompter / VC"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 font-mono mb-1">Spam Ingress Email</label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 font-mono mb-1">Synergy Intent</label>
                      <select
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        value={formData.topic}
                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                      >
                        <option value="seed">Offer $50M seed funding (priority)</option>
                        <option value="slogan">Suggest another buzzword (highly requested)</option>
                        <option value="dave">Complain about Dave's clicking speed</option>
                        <option value="soliloquy">Send unsolicited advice / prompt tips</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 font-mono mb-1">Message Payload</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Enter pitch here to be ingested by our auto-trash scraper..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 mt-4 bg-zinc-850 hover:bg-zinc-800 text-white rounded-xl font-semibold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 border border-zinc-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Enqueue Proposal</span>
                    <Send size={14} />
                  </motion.button>
                </motion.form>
              )}

              {status === 'submitting' && (
                <motion.div
                  key="submitting"
                  className="flex flex-col items-center justify-center py-16 text-center h-full"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={36} className="text-purple-400 animate-spin mb-6" />
                  <p className="text-white font-medium mb-2">Processing Suggestion</p>
                  <motion.p
                    key={loadingStep}
                    className="text-zinc-500 text-xs font-mono"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {loadingTexts[loadingStep]}
                  </motion.p>
                </motion.div>
              )}

              {status === 'submitted' && (
                <motion.div
                  key="submitted"
                  className="flex flex-col items-center justify-center py-8 text-center h-full"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle size={48} className="text-green-400 mb-4 animate-bounce" />
                  <h4 className="text-white font-bold text-lg mb-2">Ingestion Success!</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    Your email client should have opened with the proposal pre-filled. If nothing happened, your synergy has been silently judged and archived. Dave was briefly buzzed on his Apple Watch before disabling alerts.
                  </p>
                  <motion.button
                    onClick={handleReset}
                    className="py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-700 cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                  >
                    Submit Another Synergy
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
