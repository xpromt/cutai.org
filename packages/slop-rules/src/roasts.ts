import type { Tier } from './index.js';

export const roasts: Record<Tier, string[]> = {
  'certified-human': [
    'Congrats, you write like a person. Rare these days.',
    'Your text has been vetted. No slop detected. Carry on.',
    'This reads like it was written by someone with an actual point of view, not a prompt.',
    'No buzzwords, no filler, no nonsense. Are you sure you’re in tech?',
    'Zero slop. You might be the last human writer on the internet.',
  ],
  'mostly-organic': [
    'A few AI-ish crumbs, but nothing a solid edit can’t fix.',
    'Mostly clean, but we caught you glancing at the buzzword menu.',
    'You’re trying. That’s what counts. (Try a little harder.)',
    'Only a sprinkle of slop. Your dignity is mostly intact.',
    'Borderline acceptable. We’d let this pass a code review.',
  ],
  'suspiciously-smooth': [
    'This text is too polished. Nobody says “leverage” that much in real life.',
    'Suspiciously fluent. You might be a robot, or just a consultant.',
    'The prose is smooth. Too smooth. Like an AI wearing a human suit.',
    'We counted several “game-changers” — none of them were actual games changing.',
    'You had me until “unlock the full potential.” Nobody talks like that.',
  ],
  'slop-adjacent': [
    'Someone has been spending too much time with ChatGPT and it shows.',
    'This reads like a landing page for a startup that’s 80% vibe, 20% product.',
    'Delve. Tapestry. Landscape. If you remove every buzzword, this text shrinks by half.',
    'It’s giving “growth-hacked thought leadership.” Please stop.',
    'You didn’t write this. You prompted this.',
  ],
  'grade-a-slop': [
    'Grade-A slop. This text has more buzzwords than a SaaS pricing page.',
    'We found AI fingerprints all over this. Did you even read it before posting?',
    'Unmistakably AI-generated. The em-dashes alone are a dead giveaway.',
    'This is the textual equivalent of a stock photo of a handshake.',
    '🚨 SLOP ALERT 🚨 If this were any more cliché, it’d be a LinkedIn influencer post.',
  ],
};
