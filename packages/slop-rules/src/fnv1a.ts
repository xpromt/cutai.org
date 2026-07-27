export function fnv1a(text: string): number {
  let hash = 0x811c9dc5; // FNV offset basis (32-bit)
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  // Ensure unsigned 32-bit
  return hash >>> 0;
}
