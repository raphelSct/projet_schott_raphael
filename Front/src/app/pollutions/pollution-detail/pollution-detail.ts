import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Pollution } from '../../models/pollution';
import { PollutionInfo } from '../pollution-info/pollution-info';
import { ConfirmService } from '../../services/confirm.service';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pollution-detail',
  imports: [PollutionInfo, RouterLink],
  templateUrl: './pollution-detail.html',
  styleUrl: './pollution-detail.scss',
})
export class PollutionDetail implements OnInit {
  // Id read from the URL (/pollutions/:id) thanks to withComponentInputBinding()
  @Input() id!: string;

  private readonly pollutionService = inject(PollutionService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly pollution = signal<Pollution | null>(null);
  // Loading error: replaces the page content
  readonly error = signal<string | null>(null);

  ngOnInit(){
    this.pollutionService.getOne(this.id).subscribe({
      next:(pollution)=>{
        this.pollution.set(pollution);
      },
      error:(error: HttpErrorResponse)=>{
        this.error.set(
          error.status === 404
            ? "Cette pollution n'existe pas ou a été supprimée."
            : 'Impossible de charger la pollution. Réessayez plus tard.',
        );
      }
    })
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
        this.toastService.success(`« ${pollution.title} » a été supprimée.`);
        this.router.navigate(['/pollutions']);
      },
      error:()=>{
        this.toastService.error('La suppression a échoué. Réessayez plus tard.');
      }
    });
  }
}
