import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Pollution } from '../../models/pollution';
import { PollutionInfo } from '../pollution-info/pollution-info';
import { PollutionService } from '../../services/pollution.service';

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
  private readonly router = inject(Router);

  readonly pollution = signal<Pollution | null>(null);
  // Loading error: replaces the page content
  readonly error = signal<string | null>(null);
  // Deletion error: shown under the pollution, which stays displayed
  readonly deleteError = signal<string | null>(null);

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

  remove(pollution: Pollution): void {
    if (!confirm(`Supprimer « ${pollution.title} » ?`)) {
      return;
    }
    this.deleteError.set(null);

    this.pollutionService.delete(pollution.id).subscribe({
      next:()=>{
        this.router.navigate(['/pollutions']);
      },
      error:()=>{
        this.deleteError.set('La suppression a échoué. Réessayez plus tard.');
      }
    });
  }
}
