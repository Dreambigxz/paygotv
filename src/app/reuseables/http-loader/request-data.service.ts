import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestDataService {
  // private baseUrl = 'http://127.0.0.1:8000/api'; // Replace with your API endpoint
  private baseUrl = "https://paygotv-33bf80a391fc.herokuapp.com/api"
  // private baseUrl = 'https://phoenixfb-4dbc020dd64a.herokuapp.com/api'; // Replace with your API endpoint
// dfg
  constructor(
    private http: HttpClient,
  ) {}

  get(endpoint: string): Observable<any> {
      return this.http.get(`${this.baseUrl}/${endpoint}`).pipe(
    );
  }

  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, data);
  }

}
