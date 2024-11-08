/* import { Component, OnInit } from '@angular/core';
import { subscribeOn } from 'rxjs';
import { ItemCart } from 'src/app/common/item-cart';
import { Order } from 'src/app/common/order';
import { OrderProduct } from 'src/app/common/order-product';
import { OrderState } from 'src/app/common/order-state';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

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
  orderProducts:OrderProduct[] =[];
  userId:number = 2;

  constructor(private cartService: CartService, private userService: UserService, private orderService:OrderService){}

  ngOnInit(): void {
    this.items = this.cartService.convertToListFromMap();
    this.totalCart= this.cartService.totalCart();
    this.getUserById(this.userId);
  }

  generateOrder(){
    this.items.forEach(
      item =>{
        let orderProduct = new OrderProduct(null, item.productId, item.quantity, item.price);
        this.orderProducts.push(orderProduct);
      }
    )
    let order = new Order(null, new Date(), this.orderProducts, this.userId, OrderState.CANCELLED);
    console.log('Order: ' + order.orderState);    
    this.orderService.createOrder(order).subscribe(
      data => {
        console.log('orden creada con id: ' + data.id);
      }
    );

  }

  deleteItemCart(productId:number){
    this.cartService.deleteItemCart(productId);
    this.items = this.cartService.convertToListFromMap();
    this.totalCart= this.cartService.totalCart();
  }

  getUserById(id:number){
    this.userService.getUserById(id).subscribe(
      data => {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.address = data.address;
      }
    )
  }
}
  */
 // src/app/sumary-order.component.ts
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
  userId: number = 2;
  description: string = 'Compra de productos en la tienda';

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private orderService: OrderService,
    private paymentService: PaymentService // Inyectar el servicio de pago
  ) {}

  ngOnInit(): void {
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
    this.getUserById(this.userId);
    const mercadopago = new MercadoPago(environment.mercadoPagoPublicKey, {
      locale: 'es-AR' // Configura el idioma que necesitas
    });
  }

  generateOrder() {
    // Crear los detalles de los productos en el pedido
    this.items.forEach((item) => {
      let orderProduct = new OrderProduct(null, item.productId, item.quantity, item.price);
      this.orderProducts.push(orderProduct);
    });
    let order = new Order(null, new Date(), this.orderProducts, this.userId, OrderState.CANCELLED);

    // Lógica para crear el pago en Mercado Pago
    const paymentRequest = {
      amount: this.totalCart,
      token: 'TOKEN_GENERADO_EN_FRONTEND', // Colocar el token generado por el cliente de pago de Mercado Pago
      description: 'Descripción del pedido',
      installments: 1, // Puedes hacerlo dinámico si necesitas varias cuotas
      paymentMethodId: 'visa', // Ajusta según el método de pago
      payerEmail: this.email,
    };

    /* this.paymentService.createPayment(paymentRequest).subscribe(
      (response) => {
        console.log('Pago creado con éxito:', response);
      },
      (error) => {
        console.error('Error al crear el pago:', error);
      }
    ); */

    this.orderService.createOrder(order).subscribe((data) => {
      console.log('orden creada con id: ' + data.id);
    });
  }

  deleteItemCart(productId: number) {
    this.cartService.deleteItemCart(productId);
    this.items = this.cartService.convertToListFromMap();
    this.totalCart = this.cartService.totalCart();
  }

  getUserById(id: number) {
    this.userService.getUserById(id).subscribe((data) => {
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.email = data.email;
      this.address = data.address;
    });
  }
  pay() {
    this.paymentService.createPreference(this.totalCart, this.description).subscribe(
      (paymentUrl: string) => {
        window.location.href = paymentUrl; // Redirige a la página de pago de Mercado Pago
      },
      (error) => {
        console.error('Error al crear la preferencia de pago:', error);
      }
    );
  }
}
