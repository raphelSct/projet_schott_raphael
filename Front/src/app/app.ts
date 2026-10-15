import { Component } from '@angular/core';
import { DeclarationPollution } from './declaration-pollution/declaration-pollution';

@Component({
  imports: [DeclarationPollution],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
