/* import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../common/order';
import { Observable } from 'rxjs';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
 /*  updateOrderStatus(orderId: number, status: string) {
    throw new Error('Method not implemented.');
  } */

 /*   updateOrderStatus(orderId: number, status: string): Observable<void> {
      const updateUrl = `${this.apiUrl}/update/state/order`;
      const body = { id: orderId, state: status };
      return this.httpClient.post<void>(updateUrl, body, { headers: this.headerService.headers });
    }
  private apiUrl: string = 'https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/v1/orders';
  private update: string = '/update/state/order';

  constructor(private httpClient: HttpClient, private headerService:HeaderService) {}

  createOrder(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(this.apiUrl, order, {headers: this.headerService.headers});
  }
  updateOrder(formData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/${this.update}`, formData, {headers: this.headerService.headers});
  }
 
  getOrderByUser(userId: number): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${this.apiUrl}/by-user/${userId}`, {headers: this.headerService.headers});
  }
  getOrderById(orderId: number): Observable<Order> {
    return this.httpClient.get<Order>(`${this.apiUrl}/${orderId}`, {headers: this.headerService.headers});
  }
  
}
 */
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
}
