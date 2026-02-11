import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { ProductVariantService } from 'src/app/services/product-variant.service';
import { AdminToolsService } from 'src/app/services/admin-tools.service';
import { Order } from 'src/app/common/order';
import { Shipment } from 'src/app/common/shipment';
import { ProductVariant } from 'src/app/common/product-variant';
import { OrderState } from 'src/app/common/order-state';
import { SaleChannel } from 'src/app/common/sale-channel';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface KanbanCard {
  order: Order;
  shipment: Shipment | null;
  stockOk: boolean;
  stockLabel: string;
  deliveryType: 'IMMEDIATE' | 'DELAYED';
  estimatedDate?: string | null;
}

@Component({
  selector: 'app-orders-kanban',
  templateUrl: './orders-kanban.component.html',
  styleUrls: ['./orders-kanban.component.css']
})
export class OrdersKanbanComponent implements OnInit {
  isLoading = true;
  columns = {
    ready: [] as KanbanCard[],
    delayed: [] as KanbanCard[],
    blocked: [] as KanbanCard[],
    pending: [] as KanbanCard[]
  };

  private variantsById: Record<number, ProductVariant> = {};
  private shipmentsByOrder: Record<number, Shipment | null> = {};

  constructor(
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private productVariantService: ProductVariantService,
    private adminToolsService: AdminToolsService
  ) {}

  ngOnInit(): void {
    this.loadKanban();
  }

  loadKanban(): void {
    this.isLoading = true;
    this.orderService.getAdminOrders().pipe(
      switchMap((orders) => {
        const list = orders || [];
        const variantIds = this.collectVariantIds(list);
        const orderIds = list.map((order) => order.id).filter((id): id is number => !!id);

        const variants$ = variantIds.length
          ? forkJoin(variantIds.map((id) => this.productVariantService.getById(id).pipe(catchError(() => of(null)))))
          : of([]);

        const shipments$ = orderIds.length
          ? forkJoin(orderIds.map((id) => this.shipmentService.getByOrderAdmin(id).pipe(catchError(() => of(null)))))
          : of([]);

        return forkJoin({ orders: of(list), variants: variants$, shipments: shipments$, orderIds: of(orderIds) });
      })
    ).subscribe({
      next: ({ orders, variants, shipments, orderIds }) => {
        this.variantsById = {};
        variants.forEach((variant: ProductVariant | null) => {
          if (variant?.id) {
            this.variantsById[variant.id] = variant;
          }
        });

        this.shipmentsByOrder = {};
        orderIds.forEach((orderId, idx) => {
          this.shipmentsByOrder[orderId] = shipments[idx] as Shipment | null;
        });

        this.buildColumns(orders);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private buildColumns(orders: Order[]): void {
    const ready: KanbanCard[] = [];
    const delayed: KanbanCard[] = [];
    const blocked: KanbanCard[] = [];
    const pending: KanbanCard[] = [];

    orders.forEach((order) => {
      const shipment = order.id ? this.shipmentsByOrder[order.id] || null : null;
      const delivered = shipment?.status === 'DELIVERED';
      const deliveryType = this.getDeliveryType(order);
      const estimatedDate = this.getEstimatedDate(order);
      const { stockOk, stockLabel } = this.getStockStatus(order);

      const card: KanbanCard = {
        order,
        shipment,
        stockOk,
        stockLabel,
        deliveryType,
        estimatedDate
      };

      if (order.orderState === OrderState.PENDING) {
        pending.push(card);
        return;
      }

      if (order.orderState !== OrderState.COMPLETED || delivered) {
        return;
      }

      if (!stockOk) {
        blocked.push(card);
        return;
      }

      if (deliveryType === 'DELAYED') {
        delayed.push(card);
        return;
      }

      ready.push(card);
    });

    this.columns.ready = this.sortByDate(ready);
    this.columns.delayed = this.sortDelayed(delayed);
    this.columns.blocked = this.sortByDate(blocked);
    this.columns.pending = this.sortByDate(pending);
  }

  private sortByDate(cards: KanbanCard[]): KanbanCard[] {
    return [...cards].sort((a, b) => this.getOrderDate(a.order).getTime() - this.getOrderDate(b.order).getTime());
  }

  private sortDelayed(cards: KanbanCard[]): KanbanCard[] {
    return [...cards].sort((a, b) => {
      const aDate = a.estimatedDate ? new Date(a.estimatedDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.estimatedDate ? new Date(b.estimatedDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (aDate !== bDate) {
        return aDate - bDate;
      }
      return this.getOrderDate(a.order).getTime() - this.getOrderDate(b.order).getTime();
    });
  }

  private getOrderDate(order: Order): Date {
    return order.dateCreated ? new Date(order.dateCreated) : new Date();
  }

  private getDeliveryType(order: Order): 'IMMEDIATE' | 'DELAYED' {
    if (order.deliveryType === 'DELAYED') {
      return 'DELAYED';
    }
    if (order.orderProducts?.some((item) => item.deliveryType === 'DELAYED')) {
      return 'DELAYED';
    }
    return 'IMMEDIATE';
  }

  private getEstimatedDate(order: Order): string | null {
    if (order.estimatedDeliveryDate) {
      return order.estimatedDeliveryDate;
    }
    const dates = (order.orderProducts || [])
      .map((item) => item.estimatedDeliveryDate)
      .filter((date): date is string => !!date);
    if (!dates.length) {
      return null;
    }
    return dates.sort()[0];
  }

  private getStockStatus(order: Order): { stockOk: boolean; stockLabel: string } {
    if (!order.orderProducts || !order.orderProducts.length) {
      return { stockOk: true, stockLabel: 'Stock OK' };
    }
    const qtyByVariant = new Map<number, number>();
    order.orderProducts.forEach((item) => {
      const prev = qtyByVariant.get(item.productVariantId) || 0;
      qtyByVariant.set(item.productVariantId, prev + (item.quantity || 0));
    });

    let hasUnknown = false;
    for (const [variantId, qty] of qtyByVariant.entries()) {
      const variant = this.variantsById[variantId];
      if (!variant) {
        hasUnknown = true;
        continue;
      }
      const available = variant.availableStock ?? variant.stockCurrent ?? 0;
      if (available < qty) {
        return { stockOk: false, stockLabel: 'Sin stock' };
      }
    }

    if (hasUnknown) {
      return { stockOk: true, stockLabel: 'Stock OK' };
    }

    return { stockOk: true, stockLabel: 'Stock OK' };
  }

  private collectVariantIds(orders: Order[]): number[] {
    const ids = new Set<number>();
    orders.forEach((order) => {
      order.orderProducts?.forEach((item) => {
        if (item.productVariantId) {
          ids.add(item.productVariantId);
        }
      });
    });
    return Array.from(ids.values());
  }

  getSaleChannelLabel(channel?: SaleChannel | string): string {
    if (!channel) return 'Online';
    if (channel === SaleChannel.WHOLESALE) return 'Mayorista';
    if (channel === SaleChannel.OFFLINE) return 'Offline';
    return 'Online';
  }

  getShipmentStatus(orderId?: number | null): string {
    if (!orderId) return 'Pendiente';
    const shipment = this.shipmentsByOrder[orderId];
    return shipment?.status || 'Pendiente';
  }

  getPriorityLabel(type: 'ready' | 'delayed' | 'blocked' | 'pending'): string {
    if (type === 'ready') return 'Lista';
    if (type === 'delayed') return 'Demorada';
    if (type === 'blocked') return 'Sin stock';
    return 'Pendiente';
  }

  getPriorityClass(type: 'ready' | 'delayed' | 'blocked' | 'pending'): string {
    if (type === 'ready') return 'badge-ready';
    if (type === 'delayed') return 'badge-delayed';
    if (type === 'blocked') return 'badge-blocked';
    return 'badge-pending';
  }

  downloadKanbanReport(): void {
    this.adminToolsService.downloadKanbanReport().subscribe((blob) => {
      this.saveBlob(blob, 'kanban-entregas.pdf');
    });
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
