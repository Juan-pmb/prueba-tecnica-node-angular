import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/users';

  getUsers(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(this.apiUrl);
  }

  createUser(user: CreateUserRequest): Observable<UserItem> {
    return this.http.post<UserItem>(this.apiUrl, user);
  }
}