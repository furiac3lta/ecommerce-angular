import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from 'src/app/core/interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl:string ="https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/v1/home";
  
  constructor(private httpClient:HttpClient) { }

  getProducts():Observable<Product[]>{
    return this.httpClient.get<Product[]>(this.apiUrl);
  }
  getProductById(id:number):Observable<Product>{
    return this.httpClient.get<Product>(this.apiUrl+"/"+id)
  }
}
