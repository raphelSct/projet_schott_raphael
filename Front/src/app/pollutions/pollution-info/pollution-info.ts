import { Component, Input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NewPollution } from '../../models/pollution';
import { PollutionTypeLabelPipe } from '../../pipes/pollution-type-label.pipe';

// Full display of a pollution: report summary and detail page
@Component({
  selector: 'app-pollution-info',
  imports: [DatePipe, DecimalPipe, PollutionTypeLabelPipe],
  templateUrl: './pollution-info.html',
  styleUrl: './pollution-info.scss',
})
export class PollutionInfo {
  @Input({ required: true }) pollution!: NewPollution;

  // Set to true when the given URL does not point to a loadable image
  photoUnavailable = false;

  get mapUrl(): string {
    const { latitude, longitude } = this.pollution;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
  }
}
