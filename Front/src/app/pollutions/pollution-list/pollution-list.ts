import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { POLLUTION_TYPES, POLLUTION_TYPE_LABELS, Pollution } from '../../models/pollution';
import { PollutionTypeLabelPipe } from '../../pipes/pollution-type-label.pipe';
import { ConfirmService } from '../../services/confirm.service';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';

// Lowercase, without accents: "Dépôt" and "depot" must match
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

@Component({
  selector: 'app-pollution-list',
  imports: [DatePipe, PollutionTypeLabelPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './pollution-list.html',
  styleUrl: './pollution-list.scss',
})
export class PollutionList implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);

  readonly pollutionTypes = POLLUTION_TYPES;

  // Signals: the HTTP response arrives outside a template event (application without zone.js)
  readonly pollutions = signal<Pollution[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly filters = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    type: new FormControl('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
  });

  // Filter values as a signal, so that the filtered list below is recomputed on every change
  private readonly filterValues = toSignal(this.filters.valueChanges.pipe(map(() => this.filters.getRawValue())), {
    initialValue: this.filters.getRawValue(),
  });

  // Every criterion that is filled must match (dates are "yyyy-mm-dd" strings, so they compare as text)
  readonly filteredPollutions = computed(() => {
    const { search, type, from, to } = this.filterValues();
    const searchedText = normalizeText(search.trim());

    return this.pollutions().filter((pollution) => {
      const text = normalizeText(
        [pollution.title, pollution.location, pollution.description, POLLUTION_TYPE_LABELS[pollution.type]].join(' '),
      );
      return (
        (!searchedText || text.includes(searchedText)) &&
        (!type || pollution.type === type) &&
        (!from || pollution.observationDate >= from) &&
        (!to || pollution.observationDate <= to)
      );
    });
  });

  // The list is loaded when the page opens
  ngOnInit(): void {
    this.pollutionService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (pollutions) => this.pollutions.set(pollutions),
        error: () => this.error.set('Impossible de charger les pollutions. Réessayez plus tard.'),
      });
  }

  async remove(pollution: Pollution): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Supprimer cette pollution ?',
      message: `« ${pollution.title} » sera définitivement supprimée.`,
      confirmLabel: 'Supprimer',
    });
    if (!confirmed) {
      return;
    }

    this.pollutionService.delete(pollution.id).subscribe({
      next:()=>{
        this.pollutions.update((liste)=>liste.filter((p) => p.id !== pollution.id));
        this.toastService.success(`« ${pollution.title} » a été supprimée.`);
      },
      error:()=>{
        this.toastService.error(`La suppression de « ${pollution.title} » a échoué. Réessayez plus tard.`);
      }
    });
  }
}
