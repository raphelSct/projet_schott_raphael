import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, filter, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewPollution, Pollution } from '../models/pollution';

// Initial data, served as a static file from public/
const POLLUTIONS_FILE = 'mock-api/pollutions.json';

// Without a server, the browser cannot write to a file: localStorage acts as the database
// and keeps the pollutions from one page reload to the next
const STORAGE_KEY = 'mock-api.pollutions';

// Simulates the pollutions CRUD API until it exists (enabled by environment.mockApi).
// Matching requests never reach the network: the response is built here, like a server would.
export const mockPollutionsInterceptor: HttpInterceptorFn = (req, next) => {
  const pollutionsUrl = `${environment.apiUrl}/pollutions`;

  // Collection: /pollutions
  if (req.url === pollutionsUrl) {
    switch (req.method) {
      case 'GET':
        return listPollutions(req, next);
      case 'POST':
        return createPollution(req, next);
    }
  }

  // One pollution: /pollutions/:id
  const id = idFromUrl(req.url, pollutionsUrl);
  if (id) {
    switch (req.method) {
      case 'GET':
        return findPollution(req, next, id);
      case 'PUT':
        return updatePollution(req, next, id);
      case 'DELETE':
        return deletePollution(req, next, id);
    }
  }

  return next(req);
};

// GET /pollutions → 200 with the full list
function listPollutions(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return loadPollutions(next).pipe(switchMap((pollutions) => respond(req, 200, pollutions)));
}

// GET /pollutions/:id → 200 with the pollution, 404 if the id does not exist
function findPollution(req: HttpRequest<unknown>, next: HttpHandlerFn, id: string): Observable<HttpEvent<unknown>> {
  return loadPollutions(next).pipe(
    switchMap((pollutions) => {
      const pollution = pollutions.find((p) => p.id === id);
      return pollution ? respond(req, 200, pollution) : notFound(req);
    }),
  );
}

// POST /pollutions (body: NewPollution) → 201 with the created pollution; the API assigns the id
function createPollution(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return loadPollutions(next).pipe(
    switchMap((pollutions) => {
      const created: Pollution = { ...(req.body as NewPollution), id: crypto.randomUUID() };
      savePollutions([...pollutions, created]);
      return respond(req, 201, created);
    }),
  );
}

// PUT /pollutions/:id (body: the whole pollution) → 200 with the updated pollution, 404 if the id does not exist.
// The id from the URL wins over any id in the body.
function updatePollution(req: HttpRequest<unknown>, next: HttpHandlerFn, id: string): Observable<HttpEvent<unknown>> {
  return loadPollutions(next).pipe(
    switchMap((pollutions) => {
      if (!pollutions.some((p) => p.id === id)) {
        return notFound(req);
      }
      const updated: Pollution = { ...(req.body as NewPollution), id };
      savePollutions(pollutions.map((p) => (p.id === id ? updated : p)));
      return respond(req, 200, updated);
    }),
  );
}

// DELETE /pollutions/:id → 204 without body, 404 if the id does not exist
function deletePollution(req: HttpRequest<unknown>, next: HttpHandlerFn, id: string): Observable<HttpEvent<unknown>> {
  return loadPollutions(next).pipe(
    switchMap((pollutions) => {
      if (!pollutions.some((p) => p.id === id)) {
        return notFound(req);
      }
      savePollutions(pollutions.filter((p) => p.id !== id));
      return respond(req, 204);
    }),
  );
}

// "…/pollutions/42" → "42"; undefined for any other URL
function idFromUrl(url: string, pollutionsUrl: string): string | undefined {
  const prefix = `${pollutionsUrl}/`;
  if (!url.startsWith(prefix)) {
    return undefined;
  }
  const id = url.slice(prefix.length);
  return id && !id.includes('/') ? id : undefined;
}

// Pollutions saved in localStorage, or the initial data if nothing has been saved yet
function loadPollutions(next: HttpHandlerFn): Observable<Pollution[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return of(JSON.parse(stored) as Pollution[]);
  }
  // Sent with next(): this request goes straight to the network, without coming back through this interceptor
  return next(new HttpRequest('GET', POLLUTIONS_FILE)).pipe(
    filter((event): event is HttpResponse<Pollution[]> => event instanceof HttpResponse),
    map((response) => response.body ?? []),
  );
}

function savePollutions(pollutions: Pollution[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pollutions));
}

function respond<T>(req: HttpRequest<unknown>, status: number, body: T | null = null): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body, url: req.url }));
}

function notFound(req: HttpRequest<unknown>): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }));
}
