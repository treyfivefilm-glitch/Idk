import type { ComicIssue } from '../types/comic';

/**
 * Derives a short brokerage-style "ticker code" from a title + issue number,
 * e.g. "The Amazing Spider-Man" #300 -> "ASM-300". Purely cosmetic — never
 * used as a lookup key, since `ComicIssue.id` already serves that role.
 */
export function tickerCode(issue: ComicIssue): string {
  const words = issue.title
    .replace(/^The\s+/i, '')
    .split(/[\s-]+/)
    .filter(Boolean);

  const letters =
    words.length > 1
      ? words
          .map((w) => w[0])
          .join('')
          .slice(0, 5)
      : (words[0] ?? '').slice(0, 5);

  const digits = issue.issueNumber.replace(/[^0-9]/g, '') || '1';
  return `${letters.toUpperCase()}-${digits}`;
}
