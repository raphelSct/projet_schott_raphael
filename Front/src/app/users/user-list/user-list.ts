import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { User } from '../../models/user';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);

  // Logged-in user: their own account cannot be deleted from this page
  readonly currentUser = this.userService.user;

  // Signals: the HTTP response arrives outside a template event (application without zone.js)
  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.userService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => this.error.set('Impossible de charger les utilisateurs. Réessayez plus tard.'),
      });
  }

  initials(user: User): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  async remove(user: User): Promise<void> {
    const name = `${user.firstName} ${user.lastName}`;
    const confirmed = await this.confirmService.ask({
      title: 'Supprimer ce compte ?',
      message: `Le compte de ${name} (${user.username}) sera définitivement supprimé.`,
      confirmLabel: 'Supprimer',
    });
    if (!confirmed) {
      return;
    }

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.toastService.success(`Le compte de ${name} a été supprimé.`);
      },
      error: () => this.toastService.error(`La suppression du compte de ${name} a échoué. Réessayez plus tard.`),
    });
  }
}
