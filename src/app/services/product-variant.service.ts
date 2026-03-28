import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductVariant } from '../common/product-variant';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/variants`;
  private adminUrl = `${environment.apiBaseUrl}/api/v1/admin/variants`;

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  getByProduct(productId: number): Observable<ProductVariant[]> {
    return this.httpClient.get<ProductVariant[]>(`${this.apiUrl}/by-product/${productId}?ts=${Date.now()}`, {
      headers: this.headerService.headers.set('Cache-Control', 'no-cache')
    });
  }

  getById(id: number): Observable<ProductVariant> {
    return this.httpClient.get<ProductVariant>(`${this.apiUrl}/${id}?ts=${Date.now()}`, {
      headers: this.headerService.headers.set('Cache-Control', 'no-cache')
    });
  }

  save(variant: ProductVariant): Observable<ProductVariant> {
    return this.httpClient.post<ProductVariant>(this.adminUrl, variant, { headers: this.headerService.headers });
  }
}
