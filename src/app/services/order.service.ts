import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../common/order';
import { OrderState } from '../common/order-state';
import { Observable } from 'rxjs';
import { HeaderService } from './header.service';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl: string = `${environment.apiBaseUrl}/api/v1/orders`;
  private updateEndpoint: string = '/update/state/order';

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  createOrder(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(this.apiUrl, order);
  }
  

  updateOrderStatus(orderId: number, status: OrderState): Observable<Order> {
    const updateUrl = `${this.apiUrl}${this.updateEndpoint}?id=${orderId}&state=${status}`;
    return this.httpClient.post<Order>(updateUrl, {}, { headers: this.headerService.headers });
  }

  getOrderByUser(userId: number): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.httpClient.get<Order>(`${this.apiUrl}/${orderId}`);
  }
  
  getAllOrders(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(this.apiUrl, { headers: this.headerService.headers });
  }
}
