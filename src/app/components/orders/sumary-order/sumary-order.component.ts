import { Component, OnInit } from '@angular/core';
import { ItemCart } from 'src/app/common/item-cart';
import { Order } from 'src/app/common/order';
import { OrderProduct } from 'src/app/common/order-product';
import { OrderState } from 'src/app/common/order-state';
import { CartService } from 'src/app/services/cart.service';
import { HomeService } from 'src/app/services/home.service';
import { forkJoin } from 'rxjs';
import { OrderService } from 'src/app/services/order.service';
import { environment } from 'src/enviroments/enviroment';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Userdto } from 'src/app/common/userdto';
import { User } from 'src/app/common/user';
import { UserType } from 'src/app/common/user-type';
import { UserService } from 'src/app/services/user.service';
import { ProductVariantService } from 'src/app/services/product-variant.service';
import { AlertService } from 'src/app/services/alert.service';
import { MICROCOPY } from 'src/app/constants/microcopy';

@Component({
  selector: 'app-sumary-order',
  templateUrl: './sumary-order.component.html',
  styleUrls: ['./sumary-order.component.css'],
})
export class SumaryOrderComponent implements OnInit {
  environment = environment;
  items: ItemCart[] = [];
  totalCart: number = 0;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  address: string = '';
  cellphone: string = '';
  orderProducts: OrderProduct[] = [];
  userId: number = 0;
  orderCreated: Order | null = null;
  isLoggedIn: boolean = false;
  isRegisterMode: boolean = false;
  deliveryInfo: Record<number, { type: 'IMMEDIATE' | 'DELAYED'; date?: string; days?: number; note?: string }> = {};
  hasDelayedItems = false;
  isSubmitting = false;

  loginEmail: string = '';
  loginPassword: string = '';

  registerName: string = '';
  registerSurname: string = '';
  registerEmail: string = '';
  registerAddress: string = '';
  registerCellphone: string = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private sessionStorage: SessionStorageService,
    private authentication: AuthenticationService,
    private alertService: AlertService,
    private userService: UserService,
    private homeService: HomeService,
    private productVariantService: ProductVariantService
  ) {}

  ngOnInit(): void {
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
    this.refreshCartPrices();
    this.refreshDeliveryInfo();
    const userToken = this.sessionStorage.getItem('token');
    if (userToken && userToken.id) {
      this.userId = userToken.id;
      this.isLoggedIn = true;
      this.loadUserById(this.userId);
    }
  }

  private refreshCartPrices(): void {
    if (!this.items.length) {
      return;
    }
    const requests = this.items.map((item) => this.homeService.getProductById(item.productId));
    forkJoin(requests).subscribe({
      next: (products) => {
        products.forEach((product, index) => {
          const item = this.items[index];
          if (item && product && product.price != null) {
            this.cartService.updateItemPrice(item.productVariantId, product.price);
          }
        });
        this.items = this.cartService.convertToListFromMap();
        this.totalCart = this.cartService.totalCart();
      },
      error: () => {
        // Si falla, se mantiene el precio actual del carrito.
      }
    });
  }

  private refreshDeliveryInfo(): void {
    if (!this.items.length) {
      this.deliveryInfo = {};
      this.hasDelayedItems = false;
      return;
    }
    const requests = this.items.map((item) =>
      forkJoin({
        product: this.homeService.getProductById(item.productId),
        variant: this.productVariantService.getById(item.productVariantId),
      })
    );
    forkJoin(requests).subscribe({
      next: (results) => {
        const infoMap: Record<number, { type: 'IMMEDIATE' | 'DELAYED'; date?: string; days?: number; note?: string }> = {};
        let delayed = false;
        results.forEach((result, index) => {
          const item = this.items[index];
          const variant = result.variant;
          const product = result.product;
          const type = (variant?.deliveryType || product?.deliveryType || 'IMMEDIATE') as 'IMMEDIATE' | 'DELAYED';
          const date = variant?.estimatedDeliveryDate || product?.estimatedDeliveryDate || undefined;
          const days = variant?.estimatedDeliveryDays ?? product?.estimatedDeliveryDays;
          const note = variant?.deliveryNote || product?.deliveryNote || undefined;
          infoMap[item.productVariantId] = { type, date, days, note };
          if (type === 'DELAYED') {
            delayed = true;
          }
        });
        this.deliveryInfo = infoMap;
        this.hasDelayedItems = delayed;
      },
      error: () => {
        this.deliveryInfo = {};
        this.hasDelayedItems = false;
      }
    });
  }

  getDeliveryLabel(item: ItemCart): string | null {
    const info = this.deliveryInfo[item.productVariantId];
    if (!info || info.type !== 'DELAYED') {
      return null;
    }
    if (info.date) {
      return `Entrega estimada: ${new Date(info.date).toLocaleDateString()}`;
    }
    if (info.days !== undefined && info.days !== null && info.days > 0) {
      return `Entrega estimada en ${info.days} días`;
    }
    if (info.note) {
      return info.note;
    }
    return 'Este producto tiene demora de entrega.';
  }

  getGlobalDeliveryMessage(): string | null {
    if (!this.hasDelayedItems) {
      return null;
    }
    const dates: Date[] = [];
    Object.values(this.deliveryInfo).forEach((info) => {
      if (info.type !== 'DELAYED') {
        return;
      }
      if (info.date) {
        dates.push(new Date(info.date));
      }
    });
    if (dates.length) {
      const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
      return `Entrega estimada para: ${latest.toLocaleDateString()}.`;
    }
    return 'Tu pedido incluye productos con entrega diferida.';
  }

  generateOrder(): void {
    if (!this.isLoggedIn) {
      this.alertService.errorAlert('Iniciá sesión o registrate para continuar.');
      return;
    }
    if (this.isSubmitting || this.orderCreated) {
      return;
    }
    this.isSubmitting = true;

    this.orderProducts = [];
    this.items.forEach((item) => {
      let orderProduct = new OrderProduct(
        null,
        item.productVariantId,
        item.quantity,
        item.price,
        item.productName,
        item.size,
        item.color
      );
      this.orderProducts.push(orderProduct);
    });
    let order = new Order(null, new Date(), this.orderProducts, this.userId, OrderState.PENDING);

    this.alertService.infoAlert(MICROCOPY.cart.reserveStock, 'Confirmar compra').then(() => {
      this.orderService.createOrder(order).subscribe({
        next: (data) => {
          this.orderCreated = data;
          this.alertService.successAlert(MICROCOPY.cart.orderPending);
        },
        error: (error) => {
          console.error('Error al crear la orden:', error);
          this.alertService.errorAlert('No hay stock disponible para uno de los productos.');
          this.isSubmitting = false;
        }
      });
    });
  }

  sendWhatsapp(): void {
    if (!this.orderCreated) {
      return;
    }
    const total = this.orderCreated.total ?? this.totalCart;
    const customerName = `${this.firstName} ${this.lastName}`.trim();
    const customerEmail = this.orderCreated.userEmail || this.email;
    const customerPhone = this.cellphone;
    const customerAddress = this.address;
    const orderDate =
      this.orderCreated.dateCreated instanceof Date
        ? this.orderCreated.dateCreated.toLocaleString()
        : new Date(this.orderCreated.dateCreated as any).toLocaleString();
    const detailLines = this.items.map((item) => {
      const size = item.size ? ` ${item.size}` : '';
      const color = item.color ? ` ${item.color}` : '';
      const variantId = item.productVariantId ? ` · Var#${item.productVariantId}` : '';
      return `- ${item.productName}${size}${color} x${item.quantity} ($${item.price})${variantId}`;
    });
    const lines = [
      'Hola, realice una compra en Lions Brand.',
      '',
      `Orden: #${this.orderCreated.id}`,
      `Fecha: ${orderDate}`,
      `Nombre: ${customerName || '—'}`,
      `Email: ${customerEmail || '—'}`,
      `Teléfono: ${customerPhone || '—'}`,
      `Dirección: ${customerAddress || '—'}`,
      `Monto total: $${total}`,
      '',
      'Detalle:',
      ...detailLines,
      '',
      'Adjunto comprobante de transferencia.'
    ];
    const message = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${environment.whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  }

  deleteItemCart(productVariantId: number): void {
    this.cartService.deleteItemCart(productVariantId);
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
  }

updateQuantity(item: ItemCart): void {
  if (item.quantity < 1) {
    item.quantity = 1; // Aseguramos que la cantidad sea al menos 1.
  }
  this.cartService.updateItemQuantity(item.productVariantId, item.quantity);
  this.totalCart = this.cartService.totalCart();
}

  increaseQuantity(item: ItemCart): void {
    item.quantity += 1;
    this.updateQuantity(item);
  }

  decreaseQuantity(item: ItemCart): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.updateQuantity(item);
    }
  }

  login(): void {
    const userDto = new Userdto(this.loginEmail, this.loginPassword);
    this.authentication.login(userDto).subscribe({
      next: (token) => {
        this.sessionStorage.setItem('token', token);
        this.userId = token.id;
        this.isLoggedIn = true;
        this.loadUserById(this.userId);
        this.alertService.successAlert('Sesión iniciada.', 'Bienvenido');
      },
    error: () => {
      this.alertService.errorAlert('Credenciales inválidas.');
    }
  });
}

  register(): void {
  const userType = UserType.USER;
  const password = this.registerCellphone || 'lionsbrand';
  const user = new User(
    0,
    this.registerEmail,
    this.registerName,
    this.registerSurname,
    this.registerEmail,
    this.registerAddress,
    this.registerCellphone,
    password,
    userType
  );
  this.authentication.register(user).subscribe({
    next: () => {
      this.loginEmail = this.registerEmail;
      this.loginPassword = password;
      this.alertService.successAlert('Usuario registrado.');
      this.login();
    },
    error: () => {
      this.alertService.errorAlert('No se pudo registrar.');
    }
  });
}

private loadUserById(id: number): void {
  this.userService.getUserById(id).subscribe({
    next: (data) => {
      this.firstName = data.firstName || '';
      this.lastName = data.lastName || '';
      this.email = data.email || '';
      this.address = data.address || '';
      this.cellphone = data.cellphone || '';
    },
    error: () => {
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.address = '';
      this.cellphone = '';
    }
  });
}

}
