import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { SessionStorageService } from 'src/app/services/session-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule,MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent  implements OnInit {
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
menuOpen: any;

  constructor(private sessionStorage: SessionStorageService, private router: Router) {}

  ngOnInit(): void {
    const token = this.sessionStorage.getItem('token');
    this.isAdmin = token && token.type === 'ADMIN';
    this.isLoggedIn = !!token;
  }
  handleUserIconClick() {
    if (this.isLoggedIn) {
      // Si está logueado, lo puedes redirigir a su perfil o mostrar opciones adicionales
      this.router.navigate(['/profile']);
    } else {
      // Si no está logueado, lo redirige a la página de login
      this.router.navigate(['/user/login']);
    }
  }
  logout() {
    this.sessionStorage.setItem('token', null);
    this.router.navigate(['/user/login']);
  }
  cart() {
    // Redirige a la ruta del carrito
    this.router.navigate(['/cart/summary']);
  }
  gotoHome(){
    this.router.navigate(['/']);
  }
  gotoAbout(){
    this.router.navigate(['/about']);
  }
  gotoContact(){
    this.router.navigate(['/contact']);
  }
  gotoProduct(){
    this.router.navigate(['/product']);
  }
}

