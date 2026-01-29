import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isTokenExpired(): boolean {
    const stored = sessionStorage.getItem('token');
    if (!stored) {
      return true; // No hay token, por lo tanto está expirado
    }
    let tokenValue: string | null = null;
    try {
      const parsed = JSON.parse(stored);
      tokenValue = parsed?.token ?? parsed;
    } catch {
      tokenValue = stored;
    }
    if (!tokenValue || typeof tokenValue !== 'string') {
      return true;
    }
    const normalized = tokenValue.startsWith('Bearer ') ? tokenValue.slice(7) : tokenValue;
    const payload = JSON.parse(atob(normalized.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  }

  clearToken(): void {
    sessionStorage.removeItem('token');
  }
}
