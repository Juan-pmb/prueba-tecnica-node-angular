import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ReportsResponse, ReportsService } from '../../core/services/reports';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  reports: ReportsResponse | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    console.log('Dashboard iniciado');

    this.reportsService.getReports().subscribe({
      next: (response) => {
        console.log('Respuesta reports:', response);

        this.reports = response;
        this.loading = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Error reports:', error);

        this.errorMessage =
          'No fue posible cargar la información del dashboard.';

        this.loading = false;

        this.changeDetector.detectChanges();
      }
    });
  }
}