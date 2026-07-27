import { scoreText } from '../dist/index.js';

const fixtures = [
  'We need to leverage our synergy to streamline the workflow. This cutting-edge paradigm shift will revolutionize our mission-critical infrastructure.',
  "In today's fast-paced world, it's important to note that things change. In the ever-evolving landscape of technology, look no further than our solution.",
  'Get started today! Sign up for free and start your free trial. Book a demo now!',
  'This is a sentence with an em-dash. And another em-dash here.',
  'Great! Amazing! Fantastic! Incredible!',
  'It goes without saying, but at the end of the day, when it comes to our business.',
];
const text = fixtures.join('\n');
for (let i = 0; i < 3; i++) {
  const start = performance.now();
  const result = scoreText(text);
  console.log(`Run ${i}: score=${result.score}, tier=${result.tier}, time=${(performance.now() - start).toFixed(0)}ms, rules=${result.breakdown.length}`);
}
