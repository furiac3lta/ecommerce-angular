import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { Order } from 'src/app/common/order';
import { Shipment } from 'src/app/common/shipment';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.css'],
})
export class UserOrdersComponent implements OnInit {
  orders: Order[] = [];
  shipments: Record<number, Shipment | null> = {};
  userId: number | null = null;

  constructor(
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    const token = this.sessionStorage.getItem('token');
    this.userId = token?.id ?? null;
    if (this.userId) {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    if (!this.userId) {
      return;
    }
    this.orderService.getOrderByUser(this.userId).subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.orders.forEach((order) => this.loadShipment(order.id!));
      },
    });
  }

  loadShipment(orderId: number): void {
    this.shipmentService.getByOrder(orderId).subscribe({
      next: (shipment) => {
        this.shipments[orderId] = shipment;
      },
      error: () => {
        this.shipments[orderId] = null;
      },
    });
  }
}
