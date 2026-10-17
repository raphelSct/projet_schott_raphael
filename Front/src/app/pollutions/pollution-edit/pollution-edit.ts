import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NewPollution, Pollution } from '../../models/pollution';
import { PollutionForm } from '../../pollution-report/pollution-form/pollution-form';
import { PollutionService } from '../../services/pollution.service';

@Component({
  selector: 'app-pollution-edit',
  imports: [PollutionForm, RouterLink],
  templateUrl: './pollution-edit.html',
  styleUrl: './pollution-edit.scss',
})
export class PollutionEdit implements OnInit {
  // Id read from the URL (/pollutions/:id/edit) thanks to withComponentInputBinding()
  @Input() id!: string;

  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);

  // Current pollution, used to prefill the form
  readonly pollution = signal<Pollution | null>(null);
  // Loading error: replaces the form
  readonly error = signal<string | null>(null);
  // Saving error: shown under the form, which keeps what was typed
  readonly saveError = signal<string | null>(null);

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
    this.saveError.set(null);

    this.pollutionService.update(updated,this.id).subscribe({
      next:()=>{
        // Back to the detail page, which shows the saved values
        this.router.navigate(['/pollutions', this.id]);
      },
      error:()=>{
        this.saveError.set("L'enregistrement a échoué. Réessayez plus tard.");
      }
    });
  }
}
