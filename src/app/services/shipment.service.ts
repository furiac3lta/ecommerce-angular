import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { HeaderService } from './header.service';
import { Shipment, ShipmentStatus } from '../common/shipment';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1`;

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  createOrUpdate(shipment: Shipment): Observable<Shipment> {
    return this.httpClient.post<Shipment>(`${this.baseUrl}/admin/shipments`, shipment, {
      headers: this.headerService.headers,
    });
  }

  updateStatus(orderId: number, status: ShipmentStatus, updatedBy?: string): Observable<Shipment> {
    const params = new URLSearchParams({ orderId: String(orderId), status });
    if (updatedBy) {
      params.set('updatedBy', updatedBy);
    }
    return this.httpClient.post<Shipment>(`${this.baseUrl}/admin/shipments/status?${params.toString()}`, {}, {
      headers: this.headerService.headers,
    });
  }

  getByOrderAdmin(orderId: number): Observable<Shipment> {
    return this.httpClient.get<Shipment>(`${this.baseUrl}/admin/shipments/by-order/${orderId}`, {
      headers: this.headerService.headers,
    });
  }

  getByOrder(orderId: number): Observable<Shipment> {
    return this.httpClient.get<Shipment>(`${this.baseUrl}/shipments/by-order/${orderId}`, {
      headers: this.headerService.headers,
    });
  }

  getByUser(userId: number): Observable<Shipment[]> {
    return this.httpClient.get<Shipment[]>(`${this.baseUrl}/shipments/by-user/${userId}`, {
      headers: this.headerService.headers,
    });
  }
}
