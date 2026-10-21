// Codes stored by the API; the French labels shown on screen are in POLLUTION_TYPE_LABELS
export const POLLUTION_TYPES = ['plastic', 'chemical', 'illegal-dumping', 'water', 'air', 'other'] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

export const POLLUTION_TYPE_LABELS: Record<PollutionType, string> = {
  plastic: 'Plastique',
  chemical: 'Chimique',
  'illegal-dumping': 'Dépôt sauvage',
  water: 'Eau',
  air: 'Air',
  other: 'Autre',
};

// Pollution entered in the form, before the API saves it
export interface NewPollution {
  title: string;
  type: PollutionType;
  description: string;
  observationDate: string;
  location: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

// Saved pollution: the API has given it an id
export interface Pollution extends NewPollution {
  id: string;
}
