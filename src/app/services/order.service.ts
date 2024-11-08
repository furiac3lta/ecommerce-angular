import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../common/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl: string = 'https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/v1/orders';
  private update: string = '/update/state/order';

  constructor(private httpClient: HttpClient) {}

  createOrder(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(this.apiUrl, order);
  }
  updateOrder(formData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/${this.update}`, formData);
  }
  getOrderByUser(userId: number): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${this.apiUrl}/by-user/${userId}`);
  }
  getOrderById(orderId: number): Observable<Order> {
    return this.httpClient.get<Order>(`${this.apiUrl}/${orderId}`);
  }
}
