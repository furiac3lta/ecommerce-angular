import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service'; 
import { UserService } from '../../../services/user.service';
import { Order } from '../../../common/order';
import { OrderProduct } from '../../../common/order-product';
import { ChangeDetectorRef } from '@angular/core';
import { ProductVariantService } from 'src/app/services/product-variant.service';
import { OrderState } from '../../../common/order-state';
import { SaleChannel } from '../../../common/sale-channel';
import { AdminToolsService, ExcelImportResult } from 'src/app/services/admin-tools.service';
import { Shipment, ShipmentStatus } from 'src/app/common/shipment';
import { ShipmentService } from 'src/app/services/shipment.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { AlertService } from 'src/app/services/alert.service';
import { StockMovement } from 'src/app/common/stock-movement';
import { TimelineEvent } from 'src/app/common/timeline-event';
import { MICROCOPY } from 'src/app/constants/microcopy';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;
  importResult: ExcelImportResult | null = null;
  importFile: File | null = null;
  importFileName: string = 'Ningun archivo seleccionado';
  reportFrom: string = '';
  reportTo: string = '';
  kardexVariantId: number | null = null;
  stockVariantId: number | null = null;
  stockType: string = '';
  stockReason: string = '';
  salesChannelFilter: SaleChannel | '' = '';
  showShipmentModal = false;
  shipmentForm: Shipment | null = null;
  shipmentStatusOptions: ShipmentStatus[] = ['CREATED', 'SHIPPED', 'DELIVERED'];
  shipmentsByOrder: Record<number, Shipment | null> = {};
  shipmentModalMode: 'view' | 'edit' = 'edit';
  saleChannels: { value: SaleChannel; label: string }[] = [
    { value: SaleChannel.ONLINE, label: 'Online' },
    { value: SaleChannel.WHOLESALE, label: 'Mayorista' },
    { value: SaleChannel.OFFLINE, label: 'Offline' },
  ];
  searchTerm = '';
  page = 1;
  pageSize = 10;
  showReturnModal = false;
  returnOrder: Order | null = null;
  returnLines: Array<{ variantId: number; productName: string; orderedQty: number; qty: number; reason: string; note: string }> = [];
  exchangeLines: Array<{ variantId: number | null; qty: number | null; note: string; unitPrice: number | null }> = [];
  returnReasons = [
    { value: 'FALLA', label: 'Falla' },
    { value: 'TALLE_INCORRECTO', label: 'Talle incorrecto' },
    { value: 'CAMBIO', label: 'Cambio' },
    { value: 'OTRO', label: 'Otro' },
  ];
  movementsByOrder: Record<number, StockMovement[]> = {};
  timelineByOrder: Record<number, TimelineEvent[]> = {};
  openTimelines: Record<number, boolean> = {};

  constructor(
    private orderService: OrderService, 
    private productService: ProductService,
    private userService: UserService,
    private productVariantService: ProductVariantService,
    private adminToolsService: AdminToolsService,
    private shipmentService: ShipmentService,
    private sessionStorage: SessionStorageService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 30);
    this.reportFrom = from.toISOString().slice(0, 16);
    this.reportTo = now.toISOString().slice(0, 16);
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAdminOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
        this.applyFilter();
        this.isLoading = false;
        
        // Para cada orden, obtener los datos del usuario y los productos
        this.orders.forEach(order => {
          this.loadUserData(order);
          this.loadProductNames(order);
          if (order.id) {
            this.loadShipment(order.id);
            this.loadMovements(order.id);
          }
        });
      },
      (error) => {
        console.error('Error al cargar las órdenes', error);
        this.isLoading = false;
      }
    );
  }


    loadUserData(order: Order): void {
      if (order.userId) {
      
          this.userService.getUserById(order.userId).subscribe(
              userData => {
               
                  order.userName = userData?.firstName || 'Desconocido';
                  order.userEmail = userData?.email || 'No disponible';
                  this.cdr.detectChanges(); 
              },
              error => {
                
                  order.userName = 'Desconocido';
                  order.userEmail = 'No disponible';
              }
          );
      }
  }
  
  loadProductNames(order: Order): void {
    order.orderProducts.forEach((product: OrderProduct & { productName?: string }) => {
      this.productVariantService.getById(product.productVariantId).subscribe({
        next: (variant) => {
          product.size = variant.size;
          product.color = variant.color;
          this.productService.getProductById(variant.productId).subscribe(
            prodData => {
              product.productName = prodData.name;
              this.cdr.detectChanges();
            },
            () => {
              product.productName = 'Desconocido';
            }
          );
        },
        error: () => {
          product.productName = 'Desconocido';
        }
      });
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CANCELLED':
        return 'badge-CANCELLED';
      case 'PENDING':
        return 'badge-PENDING';
      case 'COMPLETED':
        return 'badge-COMPLETED';
      default:
        return 'badge-secondary';
    }
  }

  confirmOrder(orderId: number): void {
    const token = this.sessionStorage.getItem('token');
    if (!token || token.type !== 'ADMIN') {
      this.alertService.errorAlert(MICROCOPY.general.actionNotAllowed);
      return;
    }
    this.alertService.confirmAction({
      title: MICROCOPY.admin.confirmActionTitle,
      text: MICROCOPY.admin.confirmPaymentText,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.orderService.updateOrderStatus(orderId, OrderState.COMPLETED).subscribe({
        next: () => {
          this.loadOrders();
          this.alertService.successAlert(MICROCOPY.cart.orderConfirmed);
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        }
      });
    });
  }

  cancelOrder(orderId: number): void {
    const token = this.sessionStorage.getItem('token');
    if (!token || token.type !== 'ADMIN') {
      this.alertService.errorAlert(MICROCOPY.general.actionNotAllowed);
      return;
    }
    this.alertService.confirmAction({
      title: MICROCOPY.admin.confirmActionTitle,
      text: MICROCOPY.admin.cancelOrderText,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.orderService.updateOrderStatus(orderId, OrderState.CANCELLED).subscribe({
        next: () => {
          this.loadOrders();
          this.alertService.successAlert('Orden cancelada.');
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        }
      });
    });
  }

  openShipmentModal(order: Order, mode: 'view' | 'edit' = 'edit'): void {
    if (mode === 'edit' && order.id && this.shipmentsByOrder[order.id]?.status === 'DELIVERED') {
      this.alertService.errorAlert('El envío ya fue entregado y no se puede editar.');
      return;
    }
    if (order.orderState !== OrderState.COMPLETED) {
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
      recipientPhone: '',
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

  openReturnModal(order: Order): void {
    if (order.orderState !== OrderState.COMPLETED) {
      this.alertService.errorAlert('Solo podés gestionar devoluciones en órdenes COMPLETED.');
      return;
    }
    this.returnOrder = order;
    this.returnLines = (order.orderProducts || []).map((product) => ({
      variantId: product.productVariantId,
      productName: product.productName || `Variante ${product.productVariantId}`,
      orderedQty: Number(product.quantity || 0),
      qty: 0,
      reason: '',
      note: ''
    }));
    this.exchangeLines = [];
    this.showReturnModal = true;
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
    this.returnOrder = null;
    this.returnLines = [];
    this.exchangeLines = [];
  }

  addExchangeLine(): void {
    this.exchangeLines.push({ variantId: null, qty: null, note: '', unitPrice: null });
  }

  removeExchangeLine(index: number): void {
    this.exchangeLines.splice(index, 1);
  }

  submitReturn(): void {
    if (!this.returnOrder) {
      return;
    }
    const items = this.returnLines.filter((line) => line.qty > 0);
    if (!items.length) {
      this.alertService.errorAlert('Seleccioná al menos un producto a devolver.');
      return;
    }
    for (const line of items) {
      if (!line.reason) {
        this.alertService.errorAlert('Motivo obligatorio para cada devolución.');
        return;
      }
      if (!line.note || !line.note.trim()) {
        this.alertService.errorAlert('Nota obligatoria para cada devolución.');
        return;
      }
    }
    const payload = {
      orderId: this.returnOrder.id,
      items: items.map((line) => ({
        variantId: line.variantId,
        qty: line.qty,
        reason: line.reason,
        note: line.note
      })),
      createdBy: this.getCreatedBy()
    };
    this.alertService.confirmAction({
      title: MICROCOPY.admin.confirmActionTitle,
      text: MICROCOPY.admin.returnConfirm,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.orderService.createReturn(payload).subscribe({
        next: () => {
          this.alertService.successAlert(MICROCOPY.admin.returnSuccess);
          this.closeReturnModal();
          this.loadOrders();
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        }
      });
    });
  }

  submitExchange(): void {
    if (!this.returnOrder) {
      return;
    }
    const returnItems = this.returnLines.filter((line) => line.qty > 0).map((line) => ({
      variantId: line.variantId,
      qty: line.qty,
      reason: line.reason,
      note: line.note
    }));
    const newItems = this.exchangeLines
      .filter((line) => line.variantId && line.qty && line.qty > 0)
      .map((line) => ({
        variantId: line.variantId,
        qty: line.qty,
        unitPrice: line.unitPrice,
        note: line.note
      }));
    if (!returnItems.length && !newItems.length) {
      this.alertService.errorAlert('Completá devolución y/o nuevo producto.');
      return;
    }
    for (const line of returnItems) {
      if (!line.reason) {
        this.alertService.errorAlert('Motivo obligatorio para cada devolución.');
        return;
      }
      if (!line.note || !line.note.trim()) {
        this.alertService.errorAlert('Nota obligatoria para cada devolución.');
        return;
      }
    }
    for (const line of newItems) {
      if (!line.note || !line.note.trim()) {
        this.alertService.errorAlert('Nota obligatoria para cada nuevo producto.');
        return;
      }
    }
    const payload = {
      orderId: this.returnOrder.id,
      returnItems,
      newItems,
      createdBy: this.getCreatedBy()
    };
    this.alertService.confirmAction({
      title: MICROCOPY.admin.confirmActionTitle,
      text: MICROCOPY.admin.exchangeConfirm,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then((confirmed) => {
      if (!confirmed) return;
      this.orderService.createExchange(payload).subscribe({
        next: () => {
          this.alertService.successAlert(MICROCOPY.admin.exchangeSuccess);
          this.closeReturnModal();
          this.loadOrders();
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.message || MICROCOPY.general.genericError);
        }
      });
    });
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

  private loadShipment(orderId: number): void {
    this.shipmentService.getByOrderAdmin(orderId).subscribe({
      next: (shipment) => {
        this.shipmentsByOrder[orderId] = shipment;
        this.cdr.detectChanges();
      },
      error: () => {
        this.shipmentsByOrder[orderId] = null;
      }
    });
  }

  private loadMovements(orderId: number): void {
    this.orderService.getAdminMovementsByOrder(orderId).subscribe({
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
      this.orderService.getAdminTimelineByOrder(orderId).subscribe({
        next: (events) => {
          this.timelineByOrder[orderId] = events || [];
        },
        error: () => {
          this.timelineByOrder[orderId] = [];
        }
      });
    }
  }

  private getCreatedBy(): string {
    const token = this.sessionStorage.getItem('token');
    if (token && token.id) {
      return `admin:${token.id}`;
    }
    return 'admin';
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    this.importFile = file || null;
    this.importFileName = this.importFile ? this.importFile.name : 'Ningun archivo seleccionado';
  }

  uploadExcel(): void {
    if (!this.importFile) {
      return;
    }
    this.adminToolsService.uploadExcel(this.importFile).subscribe((result) => {
      this.importResult = result;
    });
  }

  downloadTemplate(): void {
    this.adminToolsService.downloadTemplate().subscribe((blob) => {
      this.saveBlob(blob, 'template.xlsx');
    });
  }

  downloadSalesReport(): void {
    this.adminToolsService.downloadSalesReport(
      this.reportFrom,
      this.reportTo,
      this.salesChannelFilter || undefined
    ).subscribe((blob) => {
      this.saveBlob(blob, 'sales-report.pdf');
    });
  }

  getSaleChannelLabel(channel?: SaleChannel | string): string {
    if (!channel) return 'Online';
    if (channel === SaleChannel.WHOLESALE) return 'Mayorista';
    if (channel === SaleChannel.OFFLINE) return 'Offline';
    return 'Online';
  }

  getDeliveryLabel(order: Order): string {
    if (order.deliveryType === 'DELAYED') {
      return order.estimatedDeliveryDate
        ? `Demorada · ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}`
        : 'Demorada';
    }
    return 'Inmediata';
  }

  getAdjustmentTotal(orderId?: number | null): number {
    if (!orderId) {
      return 0;
    }
    const movements = this.movementsByOrder[orderId] || [];
    return movements.reduce((acc, movement) => {
      if (!movement.unitPrice || !movement.qty) {
        return acc;
      }
      const amount = movement.unitPrice * movement.qty;
      if (movement.reason === 'RETURN' || movement.reason === 'EXCHANGE_IN') {
        return acc - amount;
      }
      if (movement.reason === 'EXCHANGE_OUT') {
        return acc + amount;
      }
      return acc;
    }, 0);
  }

  getAdjustmentMovements(orderId?: number | null): StockMovement[] {
    if (!orderId) {
      return [];
    }
    const movements = this.movementsByOrder[orderId] || [];
    return movements.filter((movement) =>
      movement.reason === 'RETURN' || movement.reason === 'EXCHANGE_IN' || movement.reason === 'EXCHANGE_OUT'
    );
  }

  downloadStockReport(): void {
    this.adminToolsService.downloadStockReport(
      this.reportFrom,
      this.reportTo,
      this.stockVariantId || undefined,
      this.stockType || undefined,
      this.stockReason || undefined
    ).subscribe((blob) => {
      this.saveBlob(blob, 'stock-report.pdf');
    });
  }

  downloadKardexReport(): void {
    if (!this.kardexVariantId) {
      return;
    }
    this.adminToolsService.downloadKardexReport(this.kardexVariantId, this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'kardex.pdf');
    });
  }

  downloadOrdersShipmentsReport(): void {
    this.adminToolsService.downloadOrdersShipmentsReport(this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'orders-shipments.pdf');
    });
  }

  downloadDeliveriesReport(): void {
    this.adminToolsService.downloadDeliveriesReport(this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'deliveries-report.pdf');
    });
  }

  downloadManualUsuario(): void {
    this.adminToolsService.downloadManualUsuario().subscribe((blob) => {
      this.saveBlob(blob, 'Manual_Usuario_LionsBrand.pdf');
    });
  }

  downloadManualAdmin(): void {
    this.adminToolsService.downloadManualAdmin().subscribe((blob) => {
      this.saveBlob(blob, 'Manual_Admin_LionsBrand.pdf');
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

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredOrders = [...this.orders];
      this.page = 1;
      return;
    }
    this.filteredOrders = this.orders.filter((order) => {
      const haystack = [
        order.orderNumber,
        order.id ? String(order.id) : '',
        order.userName,
        order.userEmail,
        order.orderState,
        order.saleChannel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
    this.page = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }

  get pagedOrders(): Order[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  goToPage(nextPage: number): void {
    const total = this.totalPages;
    if (nextPage < 1 || nextPage > total) {
      return;
    }
    this.page = nextPage;
  }
}
