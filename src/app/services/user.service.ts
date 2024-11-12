import { HttpClient } from '@angular/common/http';
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
