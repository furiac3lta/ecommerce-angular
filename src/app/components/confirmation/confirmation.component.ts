/* import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/common/order';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  status: string = '';
  order: Order | null = null;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    // Leer el estado del pago de los parámetros de la URL
    this.status = this.route.snapshot.queryParamMap.get('status') || 'unknown';
    console.log("Estado del pago:", this.status);

    // Recuperar la orden del localStorage
    const orderData = localStorage.getItem('currentOrder');
    if (orderData) {
      this.order = JSON.parse(orderData);
    }

    // Verificar si order tiene un valor id válido
    if (this.order && this.order.id !== null) {
      // Si el pago fue exitoso, actualizar el estado de la orden
      if (this.status === 'approved') {
        this.updateOrderStatus(this.order.id, 'CONFIRMED');
      } else if (this.status === 'rejected') {
        this.updateOrderStatus(this.order.id, 'CANCELLED');
      }
    }

    // Limpiar el localStorage
    localStorage.removeItem('currentOrder');
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe(
      () => {
        console.log(`Estado de la orden actualizado a ${status}`);
      },
      (error) => {
        console.error('Error al actualizar la orden:', error);
      }
    );
  }
}
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderState } from 'src/app/common/order-state';
import { OrderService } from 'src/app/services/order.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { Order } from 'src/app/common/order';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  status: string = '';
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.status = this.route.snapshot.queryParamMap.get('status') || 'unknown';
    console.log("Estado del pago:", this.status);
  
    const orderData = localStorage.getItem('currentOrder');
    if (orderData) {
      this.order = JSON.parse(orderData);
    }
  
    if (this.order && this.order.id !== null) {
      const orderId = this.order.id;
      const newState = this.status === 'approved' ? OrderState.CONFIRMED : OrderState.CANCELLED;
      const token = this.sessionStorage.getItem('token');
      if (token) {
        this.orderService.updateOrderStatus(orderId, newState.toString()).subscribe(
          () => {
            console.log(`Estado de la orden actualizado a ${newState}`);
            this.sessionStorage.removeItem('token');
            localStorage.removeItem('currentOrder');
          },
          (error) => {
            console.error('Error al actualizar la orden:', error);
          }
        );
      } else {
        console.error('Token no encontrado. No se puede actualizar la orden.');
      }
    }
  }
  
}
