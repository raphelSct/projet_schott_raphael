import { Routes } from '@angular/router';
import { signupRequiredGuard } from './guards/signup-required.guard';
import { PollutionReport } from './pollution-report/pollution-report';
import { PollutionDetail } from './pollutions/pollution-detail/pollution-detail';
import { PollutionEdit } from './pollutions/pollution-edit/pollution-edit';
import { PollutionList } from './pollutions/pollution-list/pollution-list';
import { Signup } from './signup/signup';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  { path: 'signup', component: Signup, title: 'Inscription' },
  {
    // All these pages require the user to have signed up
    path: '',
    canActivate: [signupRequiredGuard],
    children: [
      { path: 'pollutions', component: PollutionList, title: 'Pollutions déclarées' },
      // Declared before 'pollutions/:id', otherwise "new" would be read as an id
      { path: 'pollutions/new', component: PollutionReport, title: 'Déclarer une pollution' },
      { path: 'pollutions/:id', component: PollutionDetail, title: "Détail d'une pollution" },
      { path: 'pollutions/:id/edit', component: PollutionEdit, title: 'Modifier une pollution' },
    ],
  },
  { path: '**', redirectTo: 'pollutions' },
];
