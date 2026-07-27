import { scoreText } from '../dist/index.js';
const r = scoreText(`Not just a tool, but a platform that transforms everything. This isn't a feature — it's a revolution.`);
console.log(r.breakdown.filter(b => b.ruleId === 'not-x-but-y'));
