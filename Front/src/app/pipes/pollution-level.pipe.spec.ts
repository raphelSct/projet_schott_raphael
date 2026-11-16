import { PollutionLevelPipe } from './pollution-level.pipe';

describe('PollutionLevelPipe', () => {
  const pipe = new PollutionLevelPipe();

  // [severity index, expected label]: both ends of every range of the subject
  const cases: [number, string][] = [
    [0, 'Faible'],
    [20, 'Faible'],
    [21, 'Modérée'],
    [50, 'Modérée'],
    [51, 'Élevée'],
    [100, 'Élevée'],
    [101, 'Dangereuse'],
    [1000, 'Dangereuse'],
  ];

  for (const [index, label] of cases) {
    it(`turns ${index} into "${label}"`, () => {
      expect(pipe.transform(index)).toBe(label);
    });
  }

  it('returns an empty text when there is no valid index', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(NaN)).toBe('');
    expect(pipe.transform(-1)).toBe('');
  });
});
