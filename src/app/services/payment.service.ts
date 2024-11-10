// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl =
    'https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/payments/create-preference';

  constructor(private http: HttpClient, private headerService: HeaderService) {}

  createPreference(amount: number, description: string): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}?amount=${amount}&description=${description}`,
      {},
      {
        headers: this.headerService.headers,
        responseType: 'text' as 'json',
      }
    );
  }
}
