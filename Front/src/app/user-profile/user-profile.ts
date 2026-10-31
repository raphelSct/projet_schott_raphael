import { Component, ElementRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { User } from '../models/user';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(document:keydown.escape)': 'open = false',
  },
})
export class UserProfile {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input({ required: true }) user!: User;
  // Handled by the parent: it forgets the user and goes back to the login page
  @Output() logout = new EventEmitter<void>();

  // Opened on click rather than on hover: hover exists neither on mobile nor with the keyboard
  open = false;

  get initials(): string {
    return (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
  }

  toggle(): void {
    this.open = !this.open;
  }

  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }
}
