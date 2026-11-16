import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { HasUnsavedChanges } from '../guards/unsaved-changes.guard';
import { NewPollution, Pollution } from '../models/pollution';
import { PollutionForm } from './pollution-form/pollution-form';
import { ReportSummary } from './report-summary/report-summary';
import { PollutionService } from '../services/pollution.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-pollution-report',
  imports: [PollutionForm, ReportSummary],
  templateUrl: './pollution-report.html',
  styleUrl: './pollution-report.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionReport implements HasUnsavedChanges {

  private readonly pollutionService = inject(PollutionService);
  private readonly toastService = inject(ToastService);

  // Signal: it is set when the HTTP response arrives, outside a template event (application without zone.js)
  // Pollution saved by the API (with its id): the summary replaces the form once it is set
  readonly created = signal<Pollution | null>(null);

  // The form only exists until the pollution is saved: after that, nothing is left to lose
  private readonly form = viewChild(PollutionForm);

  // Used by unsavedChangesGuard before leaving the page
  hasUnsavedChanges(): boolean {
    return this.form()?.form.dirty ?? false;
  }

  showSummary(pollution: NewPollution): void {
    this.pollutionService.create(pollution).subscribe({
      next: (created) => {
        this.created.set(created);
        this.toastService.success('La pollution a été déclarée.');
      },
      // The form stays displayed with what was typed, so the user can try again
      error: () => this.toastService.error("L'enregistrement de la déclaration a échoué. Réessayez plus tard."),
    });
  }
}
