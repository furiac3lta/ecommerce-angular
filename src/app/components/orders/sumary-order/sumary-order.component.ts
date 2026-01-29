import { Component, OnInit } from '@angular/core';
import { ItemCart } from 'src/app/common/item-cart';
import { Order } from 'src/app/common/order';
import { OrderProduct } from 'src/app/common/order-product';
import { OrderState } from 'src/app/common/order-state';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { environment } from 'src/enviroments/enviroment';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Userdto } from 'src/app/common/userdto';
import { User } from 'src/app/common/user';
import { ToastrService } from 'ngx-toastr';
import { UserType } from 'src/app/common/user-type';
import { UserService } from 'src/app/services/user.service';

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
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
    const userToken = this.sessionStorage.getItem('token');
    if (userToken && userToken.id) {
      this.userId = userToken.id;
      this.isLoggedIn = true;
      this.loadUserById(this.userId);
    }
  }

  generateOrder(): void {
    if (!this.isLoggedIn) {
      this.toastr.error('Inicia sesión o registrate para continuar', 'Acceso requerido');
      return;
    }

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

    this.orderService.createOrder(order).subscribe({
      next: (data) => {
        this.orderCreated = data;
        this.toastr.success('Orden creada. Realiza la transferencia.', 'Orden PENDING');
      },
      error: (error) => {
        console.error('Error al crear la orden:', error);
        this.toastr.error('No hay stock disponible para uno de los productos', 'Stock insuficiente');
      }
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
        this.toastr.success('Sesión iniciada', 'Bienvenido');
      },
    error: () => {
      this.toastr.error('Credenciales inválidas', 'Login');
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
      this.toastr.success('Usuario registrado', 'Registro');
      this.login();
    },
    error: () => {
      this.toastr.error('No se pudo registrar', 'Registro');
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
