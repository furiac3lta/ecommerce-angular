import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/common/order';
import { OrderService } from 'src/app/services/order.service';
import { Shipment, ShipmentStatus } from 'src/app/common/shipment';
import { ShipmentService } from 'src/app/services/shipment.service';
import { UserService } from 'src/app/services/user.service';
import { AdminToolsService } from 'src/app/services/admin-tools.service';
import { SaleChannel } from 'src/app/common/sale-channel';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { AlertService } from 'src/app/services/alert.service';
import { MICROCOPY } from 'src/app/constants/microcopy';

@Component({
  selector: 'app-deliveries-admin',
  templateUrl: './deliveries-admin.component.html',
  styleUrls: ['./deliveries-admin.component.css']
})
export class DeliveriesAdminComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;
  shipmentsByOrder: Record<number, Shipment | null> = {};
  alerts: { todayCount: number; overdueCount: number } | null = null;
  kpis: {
    avgEstimatedDays: number;
    avgActualDays: number;
    avgDiffDays: number;
    onTimePct: number;
    overduePct: number;
    totalCompleted: number;
    totalWithEstimate: number;
    totalDelivered: number;
  } | null = null;

  reportFrom = '';
  reportTo = '';
  filterDeliveryType: '' | 'IMMEDIATE' | 'DELAYED' = '';
  filterShipmentStatus: '' | ShipmentStatus = '';
  filterSaleChannel: '' | SaleChannel = '';

  showShipmentModal = false;
  shipmentForm: Shipment | null = null;
  shipmentModalMode: 'view' | 'edit' = 'edit';
  shipmentStatusOptions: ShipmentStatus[] = ['CREATED', 'SHIPPED', 'DELIVERED'];

  constructor(
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private adminToolsService: AdminToolsService,
    private sessionStorage: SessionStorageService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 30);
    this.reportFrom = from.toISOString().slice(0, 16);
    this.reportTo = now.toISOString().slice(0, 16);
    this.loadOrders();
    this.loadAlerts();
    this.loadKpis();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAdminOrders().subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.orders.forEach((order) => {
          this.loadShipment(order);
          this.loadUser(order);
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadShipment(order: Order): void {
    if (!order.id) {
      return;
    }
    this.shipmentService.getByOrderAdmin(order.id).subscribe({
      next: (shipment) => {
        this.shipmentsByOrder[order.id!] = shipment;
        this.applyFilters();
      },
      error: () => {
        this.shipmentsByOrder[order.id!] = null;
      }
    });
  }

  private loadUser(order: Order): void {
    if (!order.userId) {
      return;
    }
    this.userService.getUserById(order.userId).subscribe({
      next: (user) => {
        order.userName = user?.firstName || 'Desconocido';
        order.userEmail = user?.email || 'No disponible';
        order.userPhone = user?.cellphone || '—';
        this.applyFilters();
      },
      error: () => {
        order.userName = 'Desconocido';
        order.userEmail = 'No disponible';
        order.userPhone = '—';
      }
    });
  }

  applyFilters(): void {
    const deliveryType = this.filterDeliveryType || null;
    const saleChannel = this.filterSaleChannel || null;
    const shipmentStatus = this.filterShipmentStatus || null;
    const filtered = this.orders.filter((order) => {
      if (deliveryType && order.deliveryType !== deliveryType) {
        return false;
      }
      if (saleChannel && order.saleChannel !== saleChannel) {
        return false;
      }
      if (shipmentStatus) {
        const shipment = order.id ? this.shipmentsByOrder[order.id] : null;
        if (!shipment || shipment.status !== shipmentStatus) {
          return false;
        }
      }
      return true;
    });
    this.filteredOrders = filtered.sort((a, b) => this.comparePriority(a, b));
    this.loadKpis();
  }

  loadAlerts(): void {
    this.adminToolsService.getDeliveryAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
      },
      error: () => {
        this.alerts = null;
      }
    });
  }

  loadKpis(): void {
    this.adminToolsService.getDeliveryKpis(
      this.reportFrom,
      this.reportTo,
      this.filterSaleChannel || undefined
    ).subscribe({
      next: (kpis) => {
        this.kpis = kpis;
      },
      error: () => {
        this.kpis = null;
      }
    });
  }

  private comparePriority(a: Order, b: Order): number {
    const stateA = a.orderState === 'COMPLETED' ? 0 : 1;
    const stateB = b.orderState === 'COMPLETED' ? 0 : 1;
    if (stateA !== stateB) return stateA - stateB;
    const typeA = a.deliveryType || 'IMMEDIATE';
    const typeB = b.deliveryType || 'IMMEDIATE';
    if (typeA !== typeB) return typeA === 'IMMEDIATE' ? -1 : 1;
    const dateA = a.estimatedDeliveryDate ? new Date(a.estimatedDeliveryDate).getTime() : Number.MAX_SAFE_INTEGER;
    const dateB = b.estimatedDeliveryDate ? new Date(b.estimatedDeliveryDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (dateA !== dateB) return dateA - dateB;
    const createdA = new Date(a.dateCreated as any).getTime();
    const createdB = new Date(b.dateCreated as any).getTime();
    return createdA - createdB;
  }

  getDeliveryLabel(order: Order): string {
    if (order.deliveryType === 'DELAYED') {
      return 'Demorada';
    }
    return 'Inmediata';
  }

  getPriorityLabel(order: Order): string {
    if (order.orderState !== 'COMPLETED') {
      return 'EN ESPERA';
    }
    if (order.deliveryType !== 'DELAYED') {
      return 'URGENTE';
    }
    if (!order.estimatedDeliveryDate) {
      return 'EN ESPERA';
    }
    const deliveryDate = new Date(order.estimatedDeliveryDate);
    const today = new Date();
    const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'URGENTE';
    if (diffDays <= 3) return 'PROXIMO';
    return 'EN ESPERA';
  }

  getPriorityClass(order: Order): string {
    const label = this.getPriorityLabel(order);
    if (label === 'URGENTE') return 'priority-urgent';
    if (label === 'PROXIMO') return 'priority-next';
    return 'priority-wait';
  }

  openShipmentModal(order: Order, mode: 'view' | 'edit' = 'edit'): void {
    if (mode === 'edit' && order.id && this.shipmentsByOrder[order.id]?.status === 'DELIVERED') {
      this.alertService.errorAlert('El envío ya fue entregado y no se puede editar.');
      return;
    }
    if (order.orderState !== 'COMPLETED') {
      this.alertService.errorAlert('Solo podés cargar envío en órdenes COMPLETED.');
      return;
    }
    this.shipmentModalMode = mode;
    this.shipmentForm = {
      orderId: order.id!,
      carrier: '',
      trackingNumber: '',
      shippingMethod: '',
      recipientName: order.userName || '',
      recipientPhone: order.userPhone || '',
      recipientAddress: '',
      notes: '',
      status: 'CREATED',
      createdBy: this.getCreatedBy(),
    };
    this.showShipmentModal = true;
    this.shipmentService.getByOrderAdmin(order.id!).subscribe({
      next: (shipment) => {
        if (shipment && shipment.id) {
          this.shipmentForm = { ...shipment };
        }
      },
      error: () => {}
    });
  }

  isShipmentEditable(orderId: number | null | undefined): boolean {
    if (!orderId) {
      return true;
    }
    return this.shipmentsByOrder[orderId]?.status !== 'DELIVERED';
  }

  closeShipmentModal(): void {
    this.showShipmentModal = false;
    this.shipmentForm = null;
  }

  saveShipment(): void {
    const shipment = this.shipmentForm;
    if (!shipment) {
      return;
    }
    if (this.shipmentModalMode === 'view') {
      return;
    }
    if (!shipment.trackingNumber || !shipment.trackingNumber.trim()) {
      this.alertService.errorAlert('El tracking es obligatorio.');
      return;
    }
    shipment.createdBy = shipment.createdBy || this.getCreatedBy();
    shipment.updatedBy = this.getCreatedBy();
    this.alertService.confirmAction({
      title: MICROCOPY.admin.confirmActionTitle,
      text: MICROCOPY.admin.shipmentInfo,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.shipmentService.createOrUpdate(shipment).subscribe({
        next: () => {
          this.alertService.successAlert(MICROCOPY.admin.shipmentSaved);
          this.closeShipmentModal();
          this.loadOrders();
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        }
      });
    });
  }

  downloadDeliveriesReport(): void {
    this.adminToolsService.downloadDeliveriesReport(
      this.reportFrom,
      this.reportTo,
      this.filterDeliveryType || undefined,
      this.filterShipmentStatus || undefined,
      this.filterSaleChannel || undefined
    ).subscribe((blob) => {
      this.saveBlob(blob, 'deliveries-report.pdf');
    });
  }

  downloadDeliveredOrdersReport(): void {
    this.adminToolsService.downloadDeliveredOrdersReport(
      this.reportFrom,
      this.reportTo,
      this.filterSaleChannel || undefined
    ).subscribe((blob) => {
      this.saveBlob(blob, 'reporte-ordenes-entregadas.pdf');
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

  private getCreatedBy(): string {
    const token = this.sessionStorage.getItem('token');
    if (token && token.id) {
      return `admin:${token.id}`;
    }
    return 'admin';
  }
}
