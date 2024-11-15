import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isTokenExpired(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return true; // No hay token, por lo tanto está expirado
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  }

  clearToken(): void {
    sessionStorage.removeItem('token');
  }
}
