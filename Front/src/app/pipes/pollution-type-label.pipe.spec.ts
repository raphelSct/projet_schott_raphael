import { PollutionType } from '../models/pollution';
import { PollutionTypeLabelPipe } from './pollution-type-label.pipe';

describe('PollutionTypeLabelPipe', () => {
  const pipe = new PollutionTypeLabelPipe();

  it('returns the French label of a type code', () => {
    expect(pipe.transform('illegal-dumping')).toBe('Dépôt sauvage');
  });

  it('returns the raw value for an unknown code', () => {
    expect(pipe.transform('unknown' as PollutionType)).toBe('unknown');
  });
});
