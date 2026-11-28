import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, inject, signal } from '@angular/core';
// Renamed: this component is also called UserProfile
import { UserProfile as StoredUser } from '../models/auth';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
})
export class UserProfile {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input({ required: true }) user!: StoredUser;
  // Handled by the parent: it forgets the user and goes back to the login page
  @Output() logout = new EventEmitter<void>();

  // Opened on click rather than on hover: hover exists neither on mobile nor with the keyboard
  readonly open = signal(false);

  // First letter of the first and of the last word of the name: "Alice Dupont" gives "AD"
  get initials(): string {
    const words = this.user.name.trim().split(/\s+/);
    const ends = words.length > 1 ? [words[0], words[words.length - 1]] : words;
    return ends.map((word) => word.charAt(0)).join('').toUpperCase();
  }

  toggle(): void {
    this.open.update((open) => !open);
  }

  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
