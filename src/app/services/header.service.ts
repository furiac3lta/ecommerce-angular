import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  constructor(private sessionStorage: SessionStorageService) {}

  get headers(): HttpHeaders {
    const tokenObj = this.sessionStorage.getItem('token');
    const tokenValue = tokenObj?.token ?? tokenObj;
    const normalizedToken =
      typeof tokenValue === 'string' && tokenValue.startsWith('Bearer ')
        ? tokenValue.slice(7)
        : tokenValue;
    return normalizedToken
      ? new HttpHeaders({ Authorization: `Bearer ${normalizedToken}` })
      : new HttpHeaders();
  }
}
