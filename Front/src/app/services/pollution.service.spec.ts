import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NewPollution, Pollution } from '../models/pollution';
import { PollutionService } from './pollution.service';

const newPollution: NewPollution = {
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
  description: 'Sacs poubelle sur la berge',
  observationDate: '2026-10-01',
  location: 'Paris',
  latitude: 48.8443,
  longitude: 2.3706,
};
const pollution: Pollution = { ...newPollution, id: '1' };

describe('PollutionService', () => {
  let service: PollutionService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/pollutions`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PollutionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the list with a GET to the environment URL', () => {
    let result: Pollution[] | undefined;

    service.getAll().subscribe((p) => (result = p));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([pollution]);
    expect(result).toEqual([pollution]);
  });

  it('gets one pollution with a GET on its id', () => {
    service.getOne('1').subscribe();

    expect(http.expectOne(`${url}/1`).request.method).toBe('GET');
  });

  it('creates a pollution with a POST of the new pollution', () => {
    service.create(newPollution).subscribe();

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(newPollution);
  });

  it('updates a pollution with a PUT on its id', () => {
    service.update(newPollution, '1').subscribe();

    const request = http.expectOne(`${url}/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(newPollution);
  });

  it('deletes a pollution with a DELETE on its id', () => {
    service.delete('1').subscribe();

    expect(http.expectOne(`${url}/1`).request.method).toBe('DELETE');
  });
});
