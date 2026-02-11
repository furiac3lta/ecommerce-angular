import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { Order } from 'src/app/common/order';
import { Shipment } from 'src/app/common/shipment';
import { StockMovement } from 'src/app/common/stock-movement';
import { TimelineEvent } from 'src/app/common/timeline-event';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.css'],
})
export class UserOrdersComponent implements OnInit {
  orders: Order[] = [];
  shipments: Record<number, Shipment | null> = {};
  movementsByOrder: Record<number, StockMovement[]> = {};
  timelineByOrder: Record<number, TimelineEvent[]> = {};
  openTimelines: Record<number, boolean> = {};
  userId: number | null = null;
  isLoading = false;

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
    this.isLoading = true;
    this.orderService.getOrderByUser(this.userId).subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.orders.forEach((order) => {
          if (order.id) {
            this.loadShipment(order.id);
            this.loadMovements(order.id);
          }
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
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

  loadMovements(orderId: number): void {
    this.orderService.getMovementsByOrder(orderId).subscribe({
      next: (movements) => {
        this.movementsByOrder[orderId] = movements || [];
      },
      error: () => {
        this.movementsByOrder[orderId] = [];
      }
    });
  }

  toggleTimeline(orderId: number): void {
    this.openTimelines[orderId] = !this.openTimelines[orderId];
    if (this.openTimelines[orderId] && !this.timelineByOrder[orderId]) {
      this.orderService.getTimelineByOrder(orderId).subscribe({
        next: (events) => {
          this.timelineByOrder[orderId] = events || [];
        },
        error: () => {
          this.timelineByOrder[orderId] = [];
        }
      });
    }
  }

  hasAdjustments(orderId: number): boolean {
    const movements = this.movementsByOrder[orderId] || [];
    return movements.some((m) => m.reason === 'RETURN' || m.reason === 'EXCHANGE_IN' || m.reason === 'EXCHANGE_OUT');
  }

  getAdjustmentLabel(reason?: string): string {
    if (reason === 'RETURN') return 'Devolución';
    if (reason === 'EXCHANGE_IN') return 'Cambio (ingreso)';
    if (reason === 'EXCHANGE_OUT') return 'Cambio (egreso)';
    return reason || 'Movimiento';
  }

  getDeliveryMessage(order: Order): string | null {
    if (order.deliveryType !== 'DELAYED') {
      return null;
    }
    if (order.estimatedDeliveryDate) {
      return `Entrega estimada para ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}.`;
    }
    return 'Tu pedido incluye productos con entrega diferida.';
  }
}
