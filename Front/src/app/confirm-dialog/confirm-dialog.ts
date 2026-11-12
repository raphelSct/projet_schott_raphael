import { Component, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

// Confirmation dialog shared by the whole application, driven by ConfirmService.
// Native <dialog> opened with showModal(): the focus stays inside, the page behind is inert, Escape cancels.
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly confirmService = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // After rendering, so that the dialog element and the question's text are in the page
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      const asked = this.confirmService.request() !== null;
      if (asked && !dialog.open) {
        dialog.showModal();
      } else if (!asked && dialog.open) {
        dialog.close();
      }
    });
  }

  // A click on the backdrop reaches the <dialog> itself; a click on its content reaches an inner element
  cancelOnBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.confirmService.answer(false);
    }
  }

  // Escape is handled in the template (keydown.escape): browsers do not always close a modal dialog on Escape
  // (anti-abuse rules), nor send "cancel" when they do. "close" is always sent, whatever closed the dialog:
  // if the question is still unanswered at that point, it means "no".
  cancelIfStillAsked(): void {
    if (this.confirmService.request()) {
      this.confirmService.answer(false);
    }
  }
}
