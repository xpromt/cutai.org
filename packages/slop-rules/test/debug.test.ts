import { describe, it, expect } from 'vitest';

describe('debug', () => {
  it('can import the module', async () => {
    const mod = await import('../src/index');
    expect(mod.scoreText).toBeDefined();
  });
});
