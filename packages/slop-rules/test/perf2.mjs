import { RULES } from '../dist/rules.js';
import { scoreText } from '../dist/index.js';

// Test each rule individually on the problematic fixture
const fixtures = [
  'We need to leverage our synergy to streamline the workflow. This cutting-edge paradigm shift will revolutionize our mission-critical infrastructure.',
  "In today's fast-paced world, it's important to note that things change. In the ever-evolving landscape of technology, look no further than our solution.",
  'Get started today! Sign up for free and start your free trial. Book a demo now!',
  'This is a sentence with an em-dash. And another em-dash here.',
  'Great! Amazing! Fantastic! Incredible!',
  'It goes without saying, but at the end of the day, when it comes to our business.',
];
const text = fixtures.join('\n');

console.log('Testing each rule individually...');
for (const rule of RULES) {
  const start = performance.now();
  try {
    const result = rule.test(text);
    const elapsed = performance.now() - start;
    console.log(`${rule.id}: ${result.count} hits, ${elapsed.toFixed(0)}ms`);
  } catch (e) {
    console.log(`${rule.id}: ERROR ${e.message}`);
  }
}

const start = performance.now();
const result = scoreText(text);
console.log(`\nFull engine: score=${result.score}, ${(performance.now()-start).toFixed(0)}ms`);
