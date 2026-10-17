import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewPollution, Pollution } from '../models/pollution';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pollutions`;

  getAll(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.url);
  }
  getOne(id : string): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.url}/${id}`);
  }
  create(pollution:NewPollution):Observable<Pollution>{
    return this.http.post<Pollution>(this.url,pollution);
  }
  update(pollution:NewPollution,id:string):Observable<Pollution>{
    return this.http.put<Pollution>(`${this.url}/${id}`,pollution);
  }
  // The API answers 204 No Content: there is nothing to read in the response
  delete(id:string):Observable<void>{
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
