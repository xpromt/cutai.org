import { RULES } from '../dist/rules.js';

const fixtures = [
  'We need to leverage our synergy to streamline the workflow.',
  "In today's fast-paced world, it's important to note that things change.",
  'Get started today! Sign up for free!',
  'This is a sentence—with an em-dash. And another—em-dash here.',
  'Great! Amazing! Fantastic! Incredible!',
  'It goes without saying, but when it comes to our business.',
];
const text = fixtures.join('\n');

// Test rules 2 onwards
for (let i = 1; i < RULES.length; i++) {
  const rule = RULES[i];
  const start = performance.now();
  try {
    const result = rule.test(text);
    const elapsed = performance.now() - start;
    console.log(`${rule.id}: ${result.count} hits, ${elapsed.toFixed(0)}ms`);
  } catch (e) {
    console.log(`${rule.id}: ERROR ${e.message}`);
  }
}
