import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ErrorItem {
  id: number;
  import_id: number;
  original_filename: string;
  row_number: number;
  field: string;
  received_value: string;
  description: string;
}

interface ErrorsResponse {
  data: ErrorItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-errors',
  imports: [],
  templateUrl: './errors.html',
  styleUrl: './errors.css'
})
export class Errors implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly apiUrl = 'http://localhost:3000/api/errors';

  errors: ErrorItem[] = [];

  currentPage = 1;
  pageSize = 10;

  totalErrors = 0;
  totalPages = 0;

  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadErrors();
  }

  getErrors(
    page: number,
    limit: number
  ): Observable<ErrorsResponse> {

    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ErrorsResponse>(
      this.apiUrl,
      { params }
    );
  }

  loadErrors(): void {
    this.loading = true;
    this.errorMessage = '';

    this.getErrors(
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.errors = response.data;
        this.currentPage = response.pagination.page;
        this.totalErrors = response.pagination.total;
        this.totalPages = response.pagination.totalPages;

        this.loading = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Error cargando errores:', error);

        this.loading = false;
        this.errorMessage =
          'No fue posible cargar los errores.';

        this.changeDetector.detectChanges();
      }
    });
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.loading
    ) {
      return;
    }

    this.currentPage = page;
    this.loadErrors();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }
}