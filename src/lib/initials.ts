/**
 * Derive uppercase initials from a name. Up to 2 characters; falls back to
 * the first letter if the name is a single word; empty string for empty input.
 *
 *   "Alex"          → "A"
 *   "Alex Smith"    → "AS"
 *   "Alex J Smith"  → "AJ"  (first two words)
 *   ""              → ""
 */
export function deriveInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
