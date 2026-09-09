import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import {
  RecordsService,
  RecordItem
} from '../../core/services/records';

@Component({
  selector: 'app-records',
  imports: [FormsModule, DatePipe],
  templateUrl: './records.html',
  styleUrl: './records.css'
})
export class Records implements OnInit {

  private readonly recordsService = inject(RecordsService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  records: RecordItem[] = [];

  search = '';
  status = '';
  documentType = '';

  currentPage = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.errorMessage = '';

    this.recordsService.getRecords(
      this.currentPage,
      this.pageSize,
      this.search,
      this.status,
      this.documentType
    ).subscribe({
      next: (response) => {
        this.records = response.data;
        this.currentPage = response.pagination.page;
        this.totalRecords = response.pagination.total;
        this.totalPages = response.pagination.totalPages;

        this.loading = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Error cargando registros:', error);

        this.loading = false;
        this.errorMessage =
          'No fue posible cargar los registros.';

        this.changeDetector.detectChanges();
      }
    });
  }

  searchRecords(): void {
    this.currentPage = 1;
    this.loadRecords();
  }

  clearFilters(): void {
    this.search = '';
    this.status = '';
    this.documentType = '';

    this.currentPage = 1;

    this.loadRecords();
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
    this.loadRecords();
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