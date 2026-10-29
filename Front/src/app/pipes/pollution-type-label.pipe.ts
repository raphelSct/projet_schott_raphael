import { Pipe, PipeTransform } from '@angular/core';
import { POLLUTION_TYPE_LABELS, PollutionType } from '../models/pollution';

// Shows the French label of a pollution type code: {{ 'illegal-dumping' | pollutionTypeLabel }} → "Dépôt sauvage"
@Pipe({ name: 'pollutionTypeLabel' })
export class PollutionTypeLabelPipe implements PipeTransform {
  transform(type: PollutionType): string {
    return POLLUTION_TYPE_LABELS[type] ?? type;
  }
}
