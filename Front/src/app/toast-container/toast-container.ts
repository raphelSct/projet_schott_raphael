import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

// Notifications shown by ToastService, stacked at the bottom of the screen
@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  readonly toastService = inject(ToastService);
}
