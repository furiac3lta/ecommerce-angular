import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../common/order';
import { OrderState } from '../common/order-state';
import { StockMovement } from '../common/stock-movement';
import { TimelineEvent } from '../common/timeline-event';
import { Observable } from 'rxjs';
import { HeaderService } from './header.service';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl: string = `${environment.apiBaseUrl}/api/v1/orders`;
  private updateEndpoint: string = '/update/state/order';
  private adminUrl: string = `${environment.apiBaseUrl}/api/v1/admin/orders`;

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  createOrder(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(this.apiUrl, order);
  }
  

  updateOrderStatus(orderId: number, status: OrderState): Observable<Order> {
    const updateUrl = `${this.adminUrl}${this.updateEndpoint}?id=${orderId}&state=${status}`;
    return this.httpClient.post<Order>(updateUrl, {}, { headers: this.headerService.headers });
  }

  getOrderByUser(userId: number): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.httpClient.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  getMovementsByOrder(orderId: number): Observable<StockMovement[]> {
    return this.httpClient.get<StockMovement[]>(`${this.apiUrl}/${orderId}/movements`);
  }

  getAdminMovementsByOrder(orderId: number): Observable<StockMovement[]> {
    return this.httpClient.get<StockMovement[]>(`${this.adminUrl}/${orderId}/movements`, { headers: this.headerService.headers });
  }

  getTimelineByOrder(orderId: number): Observable<TimelineEvent[]> {
    return this.httpClient.get<TimelineEvent[]>(`${this.apiUrl}/${orderId}/timeline`);
  }

  getAdminTimelineByOrder(orderId: number): Observable<TimelineEvent[]> {
    return this.httpClient.get<TimelineEvent[]>(`${this.adminUrl}/${orderId}/timeline`, { headers: this.headerService.headers });
  }

  createReturn(payload: any): Observable<Order> {
    return this.httpClient.post<Order>(`${this.adminUrl}/returns`, payload, { headers: this.headerService.headers });
  }

  createExchange(payload: any): Observable<Order> {
    return this.httpClient.post<Order>(`${this.adminUrl}/exchanges`, payload, { headers: this.headerService.headers });
  }
  
  getAllOrders(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(this.apiUrl);
  }

  getAdminOrders(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(this.adminUrl, { headers: this.headerService.headers });
  }
}
