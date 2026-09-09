import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecordItem {
  id: number;
  document_type: string;
  document: string;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  birth_date: string;
  status: string;
  import_id: number;
  created_at: string;
}

export interface RecordsResponse {
  data: RecordItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RecordsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/records';

  getRecords(
    page = 1,
    limit = 10,
    search = '',
    status = '',
    documentType = ''
  ): Observable<RecordsResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    if (documentType) {
      params = params.set('documentType', documentType);
    }

    return this.http.get<RecordsResponse>(this.apiUrl, { params });
  }
}