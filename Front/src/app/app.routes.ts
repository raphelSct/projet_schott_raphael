import { Routes } from '@angular/router';
import { DeclarationPollution } from './declaration-pollution/declaration-pollution';
import { inscriptionRequiseGuard } from './guards/inscription-requise.guard';
import { Inscription } from './inscription/inscription';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'declaration' },
  { path: 'inscription', component: Inscription, title: 'Inscription' },
  {
    path: 'declaration',
    component: DeclarationPollution,
    title: 'Déclarer une pollution',
    canActivate: [inscriptionRequiseGuard],
  },
  { path: '**', redirectTo: 'declaration' },
];
