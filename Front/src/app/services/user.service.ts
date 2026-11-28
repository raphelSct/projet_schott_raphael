import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Credentials, NewUser, User } from '../models/user';

// Calls to the users API. Who is logged in is kept by the NGXS store (AuthState), not here
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  signUp(newUser: NewUser): Observable<User> {
    return this.http.post<User>(this.url, newUser).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(errorMessage(error, "L'inscription a échoué", { 409: 'Ce login ou cet email est déjà utilisé.' }))),
      ),
    );
  }

  // Fictitious authentication: the API checks the password, but there is no session or token
  login(credentials: Credentials): Observable<User> {
    return this.http.post<User>(`${this.url}/login`, credentials).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(errorMessage(error, 'La connexion a échoué', { 401: 'Login ou mot de passe incorrect.' }))),
      ),
    );
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  // The API answers 204 No Content: there is nothing to read in the response
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

// Turns the HTTP error into a message to display (in French): components do not need to know HTTP status codes
function errorMessage(error: HttpErrorResponse, failure: string, byStatus: Record<number, string> = {}): string {
  if (error.status === 0) {
    return "Impossible de joindre l'API. Vérifiez qu'elle est bien démarrée.";
  }
  if (byStatus[error.status]) {
    return byStatus[error.status];
  }
  // 400: the API explains what is wrong with the data, in French
  if (error.status === 400 && typeof error.error?.message === 'string') {
    return error.error.message;
  }
  return `${failure} (erreur ${error.status}). Réessayez plus tard.`;
}
