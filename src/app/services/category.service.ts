import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../common/category';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HeaderService } from './header.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private adminApiUrl: string = `${environment.apiBaseUrl}/api/v1/admin/categories`;
  private publicApiUrl: string = `${environment.apiBaseUrl}/api/v1/categories`;
  private homeCategoriesApiUrl: string = `${environment.apiBaseUrl}/api/v1/home/categories`;
  constructor(private http:HttpClient, private headerService:HeaderService) { }

  getCategoryList():Observable<Category[]>{
    return this.http.get<Category[]>(this.publicApiUrl).pipe(
      catchError(() => this.http.get<Category[]>(this.homeCategoriesApiUrl))
    );
  }
  getAdminCategoryList():Observable<Category[]>{
    return this.http.get<Category[]>(this.adminApiUrl,{headers: this.headerService.headers});
  }
  createCategory(category:Category):Observable<Category>{
    return this.http.post<Category>(this.adminApiUrl, category, {headers: this.headerService.headers});
  }
  deleteCategoryById(id:number):Observable<any>{
    return this.http.delete(`${this.adminApiUrl}/${id}`, {headers: this.headerService.headers});
  }
  getCategoryById(id:number):Observable<Category>{
    return this.http.get<Category>(`${this.adminApiUrl}/${id}`, {headers: this.headerService.headers});
  }
}
