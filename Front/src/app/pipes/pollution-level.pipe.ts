import { Pipe, PipeTransform } from '@angular/core';
import { POLLUTION_LEVEL_LABELS, getPollutionLevel } from '../models/pollution-level';

// Turns a severity index into the French label of its level: {{ 72 | pollutionLevel }} → "Élevée"
// (empty text when there is no valid index)
@Pipe({ name: 'pollutionLevel' })
export class PollutionLevelPipe implements PipeTransform {
  transform(severityIndex: number | null | undefined): string {
    const level = getPollutionLevel(severityIndex);
    return level ? POLLUTION_LEVEL_LABELS[level] : '';
  }
}
