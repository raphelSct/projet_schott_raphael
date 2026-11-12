// The API stores a severity index (a number); the level and its French label are only worked out for display.
export const POLLUTION_LEVELS = ['low', 'moderate', 'high', 'dangerous'] as const;

export type PollutionLevel = (typeof POLLUTION_LEVELS)[number];

export const POLLUTION_LEVEL_LABELS: Record<PollutionLevel, string> = {
  low: 'Faible',
  moderate: 'Modérée',
  high: 'Élevée',
  dangerous: 'Dangereuse',
};

// 0-20 → low, 21-50 → moderate, 51-100 → high, 101 and more → dangerous.
// Returns null when there is no valid index (missing, not a number or negative).
export function getPollutionLevel(severityIndex: number | null | undefined): PollutionLevel | null {
  if (severityIndex == null || !Number.isFinite(severityIndex) || severityIndex < 0) {
    return null;
  }
  if (severityIndex <= 20) {
    return 'low';
  }
  if (severityIndex <= 50) {
    return 'moderate';
  }
  if (severityIndex <= 100) {
    return 'high';
  }
  return 'dangerous';
}
