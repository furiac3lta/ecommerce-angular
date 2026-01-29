/* import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../common/user';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = 'https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/v1/users';

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  getUserById(id: number): Observable<User> {
    const headers = this.headerService.headers;

    // Asegúrate de que el encabezado Authorization esté presente y sea correcto.
    if (!headers.has('Authorization') || headers.get('Authorization') === '') {
      console.error('El encabezado Authorization no está configurado o es inválido.');
    }

    return this.httpClient.get<User>(`${this.apiUrl}/${id}`, { headers });
  }
}
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../common/user';
import { HeaderService } from './header.service';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = `${environment.apiBaseUrl}/api/v1/users`;

  constructor(private httpClient: HttpClient, private headerService: HeaderService) {}

  getUserById(id: number): Observable<User> {
   

    if (!id || id <= 0) {
      console.error(`❌ ID inválido: ${id}`);
      return throwError(() => new Error('El ID del usuario es inválido.'));
    }

    const headers = this.headerService.headers;
    if (!headers.has('Authorization') || headers.get('Authorization') === '') {
      console.error('⚠️ El encabezado Authorization no está configurado o es inválido.');
    }


    return this.httpClient.get<User>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`❌ Error obteniendo usuario con ID ${id}:`, error);
        return throwError(() => new Error('Error obteniendo el usuario'));
      })
    );
  }
}
