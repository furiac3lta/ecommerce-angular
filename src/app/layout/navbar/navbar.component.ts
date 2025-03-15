import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { MatBadgeModule } from '@angular/material/badge';
import { CartService } from 'src/app/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  menuOpen: any;
  cartItemsQty: number = 0;
  private cartSubscription!: Subscription;

  constructor(
    private sessionStorage: SessionStorageService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const token = this.sessionStorage.getItem('token');
    this.isAdmin = token && token.type === 'ADMIN';
    this.isLoggedIn = !!token;

    // Suscribirse al carrito y actualizar la cantidad en tiempo real
    this.cartSubscription = this.cartService.getCart().subscribe((items) => {
      this.updateCartQty(items);
    });

    // Inicializar cantidad del carrito
    this.updateCartQty(this.cartService.convertToListFromMap());
  }

  private updateCartQty(items: any[]): void {
    this.cartItemsQty = items.reduce((total, item) => total + item.quantity, 0);
  }

  handleUserIconClick() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/user/login']);
    }
  }

  logout() {
    this.sessionStorage.setItem('token', null);
    this.router.navigate(['/user/login']);
  }

  cart() {
    this.router.navigate(['/cart/summary']);
  }

  gotoHome() {
    this.router.navigate(['/']);
  }

  gotoAbout() {
    this.router.navigate(['/about']);
  }

  gotoContact() {
    this.router.navigate(['/contact']);
  }

  gotoProduct() {
    this.router.navigate(['/product']);
  }

  gotoProd() {
    this.router.navigate(['/admin/product']);
  }

  gotoCat() {
    this.router.navigate(['/admin/category']);
  }
  gotoOrders(){
    this.router.navigate(['/admin/orders'])
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
