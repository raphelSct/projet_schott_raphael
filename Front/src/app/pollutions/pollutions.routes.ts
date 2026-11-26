import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../guards/unsaved-changes.guard';
import { PollutionList } from './pollution-list/pollution-list';

// Pages under /pollutions, loaded as a group when the user first opens one of them (see app.routes.ts).
// The list is in this group; the other pages are loaded on their own, when they are opened.
export const POLLUTION_ROUTES: Routes = [
  { path: '', component: PollutionList, title: 'Pollutions déclarées' },
  // Declared before ':id', otherwise "new" would be read as an id
  {
    path: 'new',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('../pollution-report/pollution-report').then((m) => m.PollutionReport),
    title: 'Déclarer une pollution',
  },
  {
    path: ':id',
    loadComponent: () => import('./pollution-detail/pollution-detail').then((m) => m.PollutionDetail),
    title: "Détail d'une pollution",
  },
  {
    path: ':id/edit',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./pollution-edit/pollution-edit').then((m) => m.PollutionEdit),
    title: 'Modifier une pollution',
  },
];
