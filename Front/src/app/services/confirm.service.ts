import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  // Label of the button that confirms, e.g. "Supprimer"
  confirmLabel: string;
}

// Asks a question in the confirmation dialog (app-confirm-dialog, placed once in the App component)
// and resolves with the user's answer: replaces the browser's confirm()
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly currentRequest = signal<ConfirmRequest | null>(null);
  readonly request = this.currentRequest.asReadonly();

  private resolveAnswer: ((confirmed: boolean) => void) | null = null;

  ask(request: ConfirmRequest): Promise<boolean> {
    // A new question cancels the one still open
    this.resolveAnswer?.(false);
    this.currentRequest.set(request);
    return new Promise((resolve) => (this.resolveAnswer = resolve));
  }

  answer(confirmed: boolean): void {
    this.resolveAnswer?.(confirmed);
    this.resolveAnswer = null;
    this.currentRequest.set(null);
  }
}
