import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { HeaderService } from './header.service';
import { StockMovement, StockMovementRequest } from '../common/stock-movement';
import { StockVariant } from '../common/stock-variant';

@Injectable({
  providedIn: 'root',
})
export class StockAdminService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1/admin/stock`;

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  getVariants(): Observable<StockVariant[]> {
    return this.httpClient.get<StockVariant[]>(`${this.baseUrl}/variants`, {
      headers: this.headerService.headers,
    });
  }

  getMovements(variantId: number, fromIso?: string, toIso?: string, type?: string, reason?: string): Observable<StockMovement[]> {
    const params = new URLSearchParams();
    params.set('variantId', String(variantId));
    if (fromIso) params.set('from', fromIso);
    if (toIso) params.set('to', toIso);
    if (type) params.set('type', type);
    if (reason) params.set('reason', reason);
    return this.httpClient.get<StockMovement[]>(`${this.baseUrl}/movements?${params.toString()}`, {
      headers: this.headerService.headers,
    });
  }

  createMovement(request: StockMovementRequest): Observable<StockMovement> {
    return this.httpClient.post<StockMovement>(`${this.baseUrl}/movements`, request, {
      headers: this.headerService.headers,
    });
  }
}
