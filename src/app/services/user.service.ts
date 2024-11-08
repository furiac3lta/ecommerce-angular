import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../common/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = 'https://ecommerce-back-0cc9b90e39e5.herokuapp.com/api/v1/users';

  constructor(private httpClient: HttpClient) {}

  getUserById(id: number): Observable<User> {
    // return this.httpClient.get<User>(this.apiUrl+ '/' + id)
    return this.httpClient.get<User>(`${this.apiUrl}/${id}`);
  }
}
