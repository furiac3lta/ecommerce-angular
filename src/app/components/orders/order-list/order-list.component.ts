import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service'; 
import { UserService } from '../../../services/user.service';
import { Order } from '../../../common/order';
import { OrderProduct } from '../../../common/order-product';
import { ChangeDetectorRef } from '@angular/core';
import { ProductVariantService } from 'src/app/services/product-variant.service';
import { OrderState } from '../../../common/order-state';
import { AdminToolsService, ExcelImportResult } from 'src/app/services/admin-tools.service';
import { Shipment, ShipmentStatus } from 'src/app/common/shipment';
import { ShipmentService } from 'src/app/services/shipment.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  importResult: ExcelImportResult | null = null;
  importFile: File | null = null;
  reportFrom: string = '';
  reportTo: string = '';
  kardexVariantId: number | null = null;
  stockVariantId: number | null = null;
  stockType: string = '';
  stockReason: string = '';
  showShipmentModal = false;
  shipmentForm: Shipment | null = null;
  shipmentStatusOptions: ShipmentStatus[] = ['CREATED', 'SHIPPED', 'DELIVERED'];
  shipmentsByOrder: Record<number, Shipment | null> = {};
  shipmentModalMode: 'view' | 'edit' = 'edit';

  constructor(
    private orderService: OrderService, 
    private productService: ProductService,
    private userService: UserService,
    private productVariantService: ProductVariantService,
    private adminToolsService: AdminToolsService,
    private shipmentService: ShipmentService,
    private sessionStorage: SessionStorageService,
    private toastr: ToastrService,
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
    this.orderService.getAllOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
        
        // Para cada orden, obtener los datos del usuario y los productos
        this.orders.forEach(order => {
          this.loadUserData(order);
          this.loadProductNames(order);
          if (order.id) {
            this.loadShipment(order.id);
          }
        });
      },
      (error) => {
        console.error('Error al cargar las órdenes', error);
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
    this.orderService.updateOrderStatus(orderId, OrderState.COMPLETED).subscribe(() => {
      this.loadOrders();
    });
  }

  cancelOrder(orderId: number): void {
    this.orderService.updateOrderStatus(orderId, OrderState.CANCELLED).subscribe(() => {
      this.loadOrders();
    });
  }

  openShipmentModal(order: Order, mode: 'view' | 'edit' = 'edit'): void {
    if (order.orderState !== OrderState.COMPLETED) {
      this.toastr.error('Solo podés cargar envío en órdenes COMPLETED', 'Envíos');
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

  closeShipmentModal(): void {
    this.showShipmentModal = false;
    this.shipmentForm = null;
  }

  saveShipment(): void {
    if (!this.shipmentForm) {
      return;
    }
    if (this.shipmentModalMode === 'view') {
      return;
    }
    if (!this.shipmentForm.trackingNumber || !this.shipmentForm.trackingNumber.trim()) {
      this.toastr.error('El tracking es obligatorio', 'Envíos');
      return;
    }
    this.shipmentForm.createdBy = this.shipmentForm.createdBy || this.getCreatedBy();
    this.shipmentForm.updatedBy = this.getCreatedBy();
    this.shipmentService.createOrUpdate(this.shipmentForm).subscribe({
      next: () => {
        this.toastr.success('Envío guardado', 'Envíos');
        this.closeShipmentModal();
        this.loadOrders();
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'No se pudo guardar el envío', 'Envíos');
      }
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
    this.adminToolsService.downloadSalesReport(this.reportFrom, this.reportTo).subscribe((blob) => {
      this.saveBlob(blob, 'sales-report.pdf');
    });
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

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
