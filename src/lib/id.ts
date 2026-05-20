/**
 * Simple ID generator. Not cryptographic; just unique-enough within a single
 * device's storage. Format: `${prefix}_${timestamp}_${random}`.
 */
export function makeId(prefix = 'id'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}
