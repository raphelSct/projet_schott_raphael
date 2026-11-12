import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

// How long a toast stays on screen: errors stay longer, they usually need to be read
const DURATION_MS: Record<ToastKind, number> = { success: 4000, error: 8000 };

// Short notifications about the result of an action, shown by app-toast-container (placed once in the App component)
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly currentToasts = signal<Toast[]>([]);
  readonly toasts = this.currentToasts.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  dismiss(id: number): void {
    this.currentToasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(kind: ToastKind, message: string): void {
    const id = ++this.nextId;
    this.currentToasts.update((toasts) => [...toasts, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), DURATION_MS[kind]);
  }
}
