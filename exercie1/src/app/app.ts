import { Component } from '@angular/core';
import { Inscription } from './inscription/inscription';

@Component({
  imports: [Inscription],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
