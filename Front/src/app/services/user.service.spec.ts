import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NewUser, User } from '../models/user';
import { UserService } from './user.service';

const newUser: NewUser = {
  username: 'adupont',
  password: 'motdepasse',
  lastName: 'Dupont',
  firstName: 'Alice',
  email: 'alice.dupont@example.com',
};

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Starts a signup and returns the error message received after the given response
  function messageAfter(status: number): string | undefined {
    let message: string | undefined;
    service.signUp(newUser).subscribe({ error: (e: Error) => (message = e.message) });
    http.expectOne(`${environment.apiUrl}/users`).flush(null, { status, statusText: 'Error' });
    return message;
  }

  it('sends the signup as a POST to the environment URL and keeps the signed-up user', () => {
    const response: User = { id: 'abc', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };
    let result: User | undefined;

    service.signUp(newUser).subscribe((u) => (result = u));

    const request = http.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(newUser);
    request.flush(response);
    expect(result).toEqual(response);
    expect(service.user()).toEqual(response);
  });

  it('returns a readable message when the API cannot be reached', () => {
    let message: string | undefined;

    service.signUp(newUser).subscribe({ error: (e: Error) => (message = e.message) });

    http.expectOne(`${environment.apiUrl}/users`).error(new ProgressEvent('error'), { status: 0 });
    expect(message).toContain("Impossible de joindre l'API");
    expect(service.user()).toBeNull();
  });

  it('reports a username or email already in use', () => {
    expect(messageAfter(409)).toBe('Ce login ou cet email est déjà utilisé.');
  });
});
