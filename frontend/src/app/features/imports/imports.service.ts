import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportRecord {
  id: number;
  original_filename: string;
  uploaded_at: string;
  uploaded_by: number;
  uploaded_by_name: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  status: string;
}

export interface ImportError {
  id: number;
  row_number: number;
  field: string;
  received_value: string;
  description: string;
}

export interface ImportsResponse {
  data: ImportRecord[];
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
export class ImportsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/imports';

  uploadFile(file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.apiUrl, formData);
  }

  getImports(page = 1, limit = 6): Observable<ImportsResponse> {
    return this.http.get<ImportsResponse>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getImportById(id: number): Observable<ImportRecord> {
    return this.http.get<ImportRecord>(`${this.apiUrl}/${id}`);
  }

  getImportErrors(id: number): Observable<ImportError[]> {
    return this.http.get<ImportError[]>(`${this.apiUrl}/${id}/errors`);
  }
}