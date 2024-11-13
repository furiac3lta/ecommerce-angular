import { Component, OnInit } from '@angular/core';
import { ItemCart } from 'src/app/common/item-cart';
import { Order } from 'src/app/common/order';
import { OrderProduct } from 'src/app/common/order-product';
import { OrderState } from 'src/app/common/order-state';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { PaymentService } from 'src/app/services/payment.service'; // Importar PaymentService
import { environment } from 'src/enviroments/enviroment';
import { SessionStorageService } from 'src/app/services/session-storage.service';

declare var MercadoPago: any;

@Component({
  selector: 'app-sumary-order',
  templateUrl: './sumary-order.component.html',
  styleUrls: ['./sumary-order.component.css'],
})
export class SumaryOrderComponent implements OnInit {
  items: ItemCart[] = [];
  totalCart: number = 0;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  address: string = '';
  orderProducts: OrderProduct[] = [];
  userId: number = 0;
  description: string = 'Compra de productos en la tienda';

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private orderService: OrderService,
    private paymentService: PaymentService, // Inyectar el servicio de pago
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    // Obtener items del carrito
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
    // Obtener ID del usuario desde el almacenamiento de sesión
    const userToken = this.sessionStorage.getItem('token');
    if (userToken && userToken.id) {
      this.userId = userToken.id;
      this.getUserById(this.userId);
    }
    // Inicializar Mercado Pago
    const mercadopago = new MercadoPago(environment.mercadoPagoPublicKey, {
      locale: 'es-AR', // Configura el idioma que necesitas
    });
    // Borrar sesión después de un tiempo determinado
    setTimeout(() => {
      this.sessionStorage.removeItem('token');
    }, 600000);
  }

  generateOrder(): void {
    // Crear los detalles de los productos en el pedido
    this.items.forEach((item) => {
      let orderProduct = new OrderProduct(null, item.productId, item.quantity, item.price);
      this.orderProducts.push(orderProduct);
    });
    // Crear el pedido con estado "CANCELLED" por defecto
    let order = new Order(null, new Date(), this.orderProducts, this.userId, OrderState.CANCELLED);

    // Crear el pedido en el backend antes de proceder al pago
    this.orderService.createOrder(order).subscribe({
      next: (data) => {
        console.log('Orden creada con id: ' + data.id);
        localStorage.setItem('currentOrder', JSON.stringify(data));
        // Una vez creada la orden, proceder con el pago
        this.pay();
      },
      error: (error) => {
        console.error('Error al crear la orden:', error);
      }
    });
  }

  pay(): void {
    // Lógica para crear la preferencia de pago
    this.paymentService.createPreference(this.totalCart, this.description).subscribe(
      (paymentUrl: string) => {
        // Abrir la página de pago de Mercado Pago en una nueva pestaña
        window.open(paymentUrl, '_blank');
      },
      (error) => {
        console.error('Error al crear la preferencia de pago:', error);
      }
    );
  }

  deleteItemCart(productId: number): void {
    this.cartService.deleteItemCart(productId);
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
  }

  getUserById(id: number): void {
    this.userService.getUserById(id).subscribe(
      (data) => {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.address = data.address;
      },
      (error) => {
        console.error('Error al obtener la información del usuario:', error);
      }
    );
  }
}
