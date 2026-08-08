import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SmsResponse {
  success: boolean;
  sid?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class SmsService {
  private readonly apiUrl =
    'https://us-central1-stock-list-8fa75.cloudfunctions.net/sendSms';

  constructor(private readonly http: HttpClient) {}

  sendSms(to: string, message: string): Observable<SmsResponse> {
    return this.http.post<SmsResponse>(this.apiUrl, { to, message });
  }
}