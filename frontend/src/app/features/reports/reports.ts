import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { DecimalPipe } from '@angular/common';

import {
  ReportsResponse,
  ReportsService
} from '../../core/services/reports';

@Component({
  selector: 'app-reports',
  imports: [DecimalPipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  private readonly reportsService = inject(ReportsService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  reports: ReportsResponse | null = null;

  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reportsService.getReports().subscribe({
      next: (response) => {
        this.reports = response;
        this.loading = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Error cargando reportes:', error);

        this.loading = false;
        this.errorMessage =
          'No fue posible cargar los reportes.';

        this.changeDetector.detectChanges();
      }
    });
  }
}