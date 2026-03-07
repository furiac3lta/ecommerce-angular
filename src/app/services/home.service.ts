import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from 'src/app/core/interfaces/product.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl:string = `${environment.apiBaseUrl}/api/v1/home`;
  
  constructor(private httpClient:HttpClient) { }

  getProducts():Observable<Product[]>{
    return this.httpClient.get<Product[]>(this.apiUrl).pipe(
      map((products) => products.map((product) => this.normalizeProduct(product)))
    );
  }
  getProductById(id:number):Observable<Product>{
    return this.httpClient.get<Product>(this.apiUrl+"/"+id).pipe(
      map((product) => this.normalizeProduct(product))
    );
  }

  private normalizeProduct(product: Product): Product {
    const images = Array.isArray(product.images)
      ? product.images.filter(Boolean).map((url) => this.ensureHttps(url))
      : [];

    return {
      ...product,
      urlImage: this.ensureHttps(product.urlImage),
      images
    };
  }

  private ensureHttps(url: string | undefined | null): string {
    if (!url) {
      return '';
    }
    return url.startsWith('http://') ? `https://${url.slice(7)}` : url;
  }
}
