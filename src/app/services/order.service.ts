import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../common/order';
import { Observable } from 'rxjs';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl: string = 'https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/v1/orders';
  private updateEndpoint: string = '/update/state/order';

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  createOrder(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(this.apiUrl, order, { headers: this.headerService.headers });
  }
  

  updateOrderStatus(orderId: number, status: string): Observable<void> {
    const updateUrl = `${this.apiUrl}${this.updateEndpoint}?id=${orderId}&state=${status}`;
    return this.httpClient.post<void>(updateUrl, {}, { headers: this.headerService.headers });
  }

  getOrderByUser(userId: number): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${this.apiUrl}/by-user/${userId}`, { headers: this.headerService.headers });
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.httpClient.get<Order>(`${this.apiUrl}/${orderId}`, { headers: this.headerService.headers });
  }
  
  getAllOrders(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(this.apiUrl, { headers: this.headerService.headers });
  }
}
