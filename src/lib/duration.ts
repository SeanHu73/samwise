export interface DurationProfile {
  low: number;
  typical: number;
  high: number;
  samples: number;
  confidence: "low" | "medium" | "high";
}
export function durationProfile(
  values: number[],
  exclude: number[] = [],
): DurationProfile | undefined {
  const clean = values
    .filter((value, index) => value > 0 && !exclude.includes(index))
    .sort((a, b) => a - b);
  if (!clean.length) return;
  const percentile = (p: number) =>
    clean[Math.min(clean.length - 1, Math.floor((clean.length - 1) * p))];
  return {
    low: percentile(0.25),
    typical: percentile(0.5),
    high: percentile(0.75),
    samples: clean.length,
    confidence:
      clean.length >= 10 ? "high" : clean.length >= 5 ? "medium" : "low",
  };
}
