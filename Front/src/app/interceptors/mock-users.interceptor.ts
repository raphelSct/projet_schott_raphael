import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { filter, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewUser, User } from '../models/user';

// Existing accounts, served as a static file from public/
// (no passwords: anything in public/ can be downloaded)
const USERS_FILE = 'mock-api/users.json';

// Simulates the users API until it exists (enabled by environment.mockApi):
// sign-up requests never reach a server, the response is built here from the JSON file
export const mockUsersInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.url !== `${environment.apiUrl}/users`) {
    return next(req);
  }
  const newUser = req.body as NewUser;

  return next(req.clone({ method: 'GET', url: USERS_FILE, body: null })).pipe(
    filter((event): event is HttpResponse<User[]> => event instanceof HttpResponse),
    switchMap((response) => {
      const existing = response.body ?? [];
      if (existing.some((u) => u.username === newUser.username || u.email === newUser.email)) {
        return throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict', url: req.url }));
      }

      // Like the real API would: it assigns an id and never returns the password
      const created: User = {
        id: crypto.randomUUID(),
        username: newUser.username,
        lastName: newUser.lastName,
        firstName: newUser.firstName,
        email: newUser.email,
      };
      return of<HttpEvent<User>>(new HttpResponse({ status: 201, body: created, url: req.url }));
    }),
  );
};
