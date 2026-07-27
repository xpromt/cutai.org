import { scoreText } from '../dist/index.js';

const buzzFix = `We need to leverage our synergy to streamline the workflow. This cutting-edge paradigm shift will revolutionize our mission-critical infrastructure. Let's deep-dive and circle-back on the low-hanging fruit. Our holistic approach empowers us to think outside the box while delivering impactful, scalable solutions.`;
const r1 = scoreText(buzzFix);
console.log('Buzz fixture:', { score: r1.score, tier: r1.tier, rules: r1.breakdown.map(b => `${b.ruleId}(${b.points})`) });

const notX = `This isn't just a product — it's a revolution. Not just a tool, but a platform that transforms everything. Our solution is not a feature, it's a new paradigm.`;
const r2 = scoreText(notX);
console.log('Not-X fixture:', { score: r2.score, tier: r2.tier, rules: r2.breakdown.map(b => `${b.ruleId}(${b.points})`) });
