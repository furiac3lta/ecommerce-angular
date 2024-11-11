/* import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  status: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Leer el estado del pago de los parámetros de la URL
    this.status = this.route.snapshot.queryParamMap.get('status') || 'unknown';
    console.log("Estado del pago:", this.status);
  }
}
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  status: string = '';
  orderId: number | null = null;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    // Leer el estado del pago y el ID de la orden de los parámetros de la URL
    this.status = this.route.snapshot.queryParamMap.get('status') || 'unknown';
    const orderIdParam = this.route.snapshot.queryParamMap.get('order_id');

    // Validar y convertir el ID de la orden a un número si está presente
    if (orderIdParam) {
      this.orderId = Number(orderIdParam);
      if (isNaN(this.orderId)) {
        console.error('El parámetro order_id no es un número válido.');
        this.orderId = null;
      }
    }

    console.log("Estado del pago:", this.status);

    // Si el estado del pago es exitoso y el ID de la orden es válido, actualizar el estado de la orden
    if (this.status === 'success' && this.orderId !== null) {
      this.updateOrderStatus(this.orderId, 'CONFIRMED');
    }
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe(
      () => {
        console.log(`Orden ${orderId} actualizada a ${status}`);
      },
      (error: any) => {
        console.error('Error al actualizar la orden:', error);
      }
    );
  }
}
