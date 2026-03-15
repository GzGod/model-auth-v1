export const SCORE_WEIGHTS = {
  a: 0.3,
  b: 0.35,
  c: 0.2,
  d: 0.15
} as const;

export const VERDICT_THRESHOLD = {
  trusted: 80,
  suspicious: 60
} as const;

export function hasHardRedFlag(flags: string[]): boolean {
  return flags.some((flag) => flag.startsWith("hard:"));
}
