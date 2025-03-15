import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service'; 
import { UserService } from '../../../services/user.service';
import { Order } from '../../../common/order';
import { OrderProduct } from '../../../common/order-product';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService, 
    private productService: ProductService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
        
        // Para cada orden, obtener los datos del usuario y los productos
        this.orders.forEach(order => {
          this.loadUserData(order);
          this.loadProductNames(order);
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
      this.productService.getProductById(product.productId).subscribe(
        prodData => {
          product.productName = prodData.name;
          this.cdr.detectChanges(); // Forzar actualización de la vista
        },
        error => {
          product.productName = 'Desconocido';
        }
      );
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CANCELLED':
        return 'badge-CANCELLED';
      case 'PENDING':
        return 'badge-PENDING';
      case 'CONFIRMED':
        return 'badge-COMPLETED';
      default:
        return 'badge-secondary';
    }
  }
}
