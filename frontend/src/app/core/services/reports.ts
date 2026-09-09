import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportsResponse {
  users: {
    total: number;
  };

  records: {
    total: number;
    active: number;
    inactive: number;
  };

  imports: {
    total: number;
    completed: number;
    failed: number;
    processedRecords: number;
    validRecords: number;
    invalidRecords: number;
  };

  errors: {
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/reports';

  getReports(): Observable<ReportsResponse> {
    return this.http.get<ReportsResponse>(this.apiUrl);
  }
}