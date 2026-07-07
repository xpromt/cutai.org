import { motion, useInView } from 'framer-motion';
import { BarChart3, Users, Infinity as InfinityIcon, TrendingUp, Quote } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

function AsymptoticCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [extra9s, setExtra9s] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / 2000, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  useEffect(() => {
    if (value < target) return;
    const interval = setInterval(() => {
      setExtra9s(prev => Math.min(prev + 1, 4));
    }, 2000);
    return () => clearInterval(interval);
  }, [value, target]);

  const displayValue = extra9s > 0
    ? `${value}.${'9'.repeat(extra9s)}`
    : `${value}`;

  return (
    <div ref={ref}>
      {displayValue}{suffix}
    </div>
  );
}

function SlotMachineCounter({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    const spinDuration = 1500;
    const start = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const elapsed = now - start;
      if (elapsed < spinDuration) {
        setValue(Math.floor(Math.random() * 99999));
        frame = requestAnimationFrame(animate);
      } else {
        setValue(target);
        setSpinning(false);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  useEffect(() => {
    if (spinning) return;
    const interval = setInterval(() => {
      setValue(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [spinning]);

  return <div ref={ref}>{value.toLocaleString()}</div>;
}

const stats = [
  {
    icon: BarChart3,
    value: 98.7,
    suffix: '%',
    label: 'of statistics on AI landing pages are visually impressive.',
    source: 'another AI',
    isAsymptotic: true,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Users,
    value: 12481,
    suffix: '',
    label: 'Founders currently building "the future".',
    sublabel: 'All using the same gradient.',
    isSlotMachine: true,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: InfinityIcon,
    value: 0,
    suffix: '',
    label: 'Productivity unlocked.',
    sublabel: 'No products shipped.',
    isInfinite: true,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
];

export function FakeStats() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className={`relative p-8 rounded-2xl border border-zinc-800 ${stat.bgColor} backdrop-blur-sm`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              animate={{
                y: [0, -5, 0],
              }}
            >
              <div className={`${stat.color} mb-4`}>
                <stat.icon size={40} />
              </div>

              <div className={`text-5xl font-bold ${stat.color} mb-2 font-mono`}>
                {stat.isAsymptotic ? (
                  <AsymptoticCounter target={stat.value} suffix={stat.suffix} />
                ) : stat.isSlotMachine ? (
                  <SlotMachineCounter target={stat.value} />
                ) : stat.isInfinite ? (
                  <span>{'>='}infinity</span>
                ) : (
                  stat.value
                )}
              </div>

              <p className="text-zinc-300 mb-2">{stat.label}</p>

              {stat.sublabel && (
                <p className="text-zinc-500 text-sm">{stat.sublabel}</p>
              )}

              {stat.source && (
                <motion.div
                  className="flex items-center gap-1 text-xs text-zinc-600 mt-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2 }}
                >
                  <Quote size={12} />
                  <span>Source: {stat.source}</span>
                </motion.div>
              )}

              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp size={20} className="text-green-500/50" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
