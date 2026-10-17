import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pollution } from '../../models/pollution';
import { PollutionInfo } from '../../pollutions/pollution-info/pollution-info';

@Component({
  imports: [PollutionInfo, RouterLink],
  selector: 'app-report-summary',
  styleUrl: './report-summary.scss',
  templateUrl: './report-summary.html',
})
export class ReportSummary {
  // Pollution saved by the API: its id leads to the edit page
  @Input({required:true}) pollution: Pollution={
    id: '',
    title: '',
    type: 'other',
    description: '',
    observationDate: '',
    location: '',
    latitude: 0,
    longitude: 0
  };
}
