import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NewUser, User } from '../models/user';
import { mockUsersInterceptor } from './mock-users.interceptor';

const existingUsers: User[] = [
  { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' },
];

const newUser: NewUser = {
  username: 'cbernard',
  password: 'motdepasse',
  lastName: 'Bernard',
  firstName: 'Chloé',
  email: 'chloe.bernard@example.com',
};

describe('mockUsersInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  const signupUrl = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockUsersInterceptor])), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads the JSON file and returns the new user, without the password', () => {
    let result: User | undefined;

    client.post<User>(signupUrl, newUser).subscribe((u) => (result = u));

    const fileRequest = http.expectOne('mock-api/users.json');
    expect(fileRequest.request.method).toBe('GET');
    fileRequest.flush(existingUsers);

    expect(result).toEqual({
      id: expect.any(String),
      username: 'cbernard',
      lastName: 'Bernard',
      firstName: 'Chloé',
      email: 'chloe.bernard@example.com',
    });
  });

  it('responds 409 when the username or email already exists in the file', () => {
    let status: number | undefined;

    client
      .post<User>(signupUrl, { ...newUser, username: 'adupont' })
      .subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    http.expectOne('mock-api/users.json').flush(existingUsers);

    expect(status).toBe(409);
  });

  it('lets other requests through', () => {
    client.get('/other').subscribe();

    http.expectOne('/other').flush({});
  });
});
