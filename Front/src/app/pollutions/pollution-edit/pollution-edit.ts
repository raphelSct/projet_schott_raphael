import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { NewPollution, Pollution } from '../../models/pollution';
import { PollutionForm } from '../../pollution-report/pollution-form/pollution-form';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pollution-edit',
  imports: [PollutionForm, RouterLink],
  templateUrl: './pollution-edit.html',
  styleUrl: './pollution-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionEdit implements OnInit, HasUnsavedChanges {
  // Id read from the URL (/pollutions/:id/edit) thanks to withComponentInputBinding()
  @Input() id!: string;

  private readonly pollutionService = inject(PollutionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Current pollution, used to prefill the form
  readonly pollution = signal<Pollution | null>(null);
  // Loading error: replaces the form
  readonly error = signal<string | null>(null);

  private readonly form = viewChild(PollutionForm);
  // Set once the changes are saved: the form is still "dirty" when the page is left for the detail page
  private saved = false;

  // Used by unsavedChangesGuard before leaving the page
  hasUnsavedChanges(): boolean {
    return !this.saved && (this.form()?.form.dirty ?? false);
  }

  ngOnInit(): void {
    this.pollutionService.getOne(this.id).subscribe({
      next: (pollution) => this.pollution.set(pollution),
      error: (error: HttpErrorResponse) =>
        this.error.set(
          error.status === 404
            ? "Cette pollution n'existe pas ou a été supprimée."
            : 'Impossible de charger la pollution. Réessayez plus tard.',
        ),
    });
  }

  save(updated: NewPollution): void {
    this.pollutionService.update(updated,this.id).subscribe({
      next:()=>{
        this.toastService.success('Les modifications ont été enregistrées.');
        this.saved = true;
        // Back to the detail page, which shows the saved values
        this.router.navigate(['/pollutions', this.id]);
      },
      error:()=>{
        // The form stays displayed with what was typed, so the user can try again
        this.toastService.error("L'enregistrement des modifications a échoué. Réessayez plus tard.");
      }
    });
  }
}
