import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewUser, User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  // User who signed up during this visit. No session yet: it is lost when the page reloads
  private readonly currentUser = signal<User | null>(null);
  readonly user = this.currentUser.asReadonly();

  signUp(newUser: NewUser): Observable<User> {
    return this.http.post<User>(this.url, newUser).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError((error: HttpErrorResponse) => throwError(() => new Error(errorMessage(error)))),
    );
  }
}

// Turns the HTTP error into a message to display (in French): components do not need to know HTTP status codes
function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return "Impossible de joindre l'API. Vérifiez qu'elle est bien démarrée.";
  }
  if (error.status === 409) {
    return 'Ce login ou cet email est déjà utilisé.';
  }
  return `L'inscription a échoué (erreur ${error.status}). Réessayez plus tard.`;
}
