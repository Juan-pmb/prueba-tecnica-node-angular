import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  ImportsService,
  ImportRecord,
  ImportError
} from './imports.service';

@Component({
  selector: 'app-imports',
  imports: [DatePipe],
  templateUrl: './imports.html',
  styleUrl: './imports.css'
})
export class Imports implements OnInit {
  private readonly importsService = inject(ImportsService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  selectedFile: File | null = null;

  imports: ImportRecord[] = [];

  selectedImport: ImportRecord | null = null;
  importErrors: ImportError[] = [];

  loading = false;
  loadingHistory = true;
  loadingDetail = false;

  successMessage = '';
  errorMessage = '';

  // Paginación
  currentPage = 1;
  pageSize = 6;
  totalImports = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadImports();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.successMessage = '';
    this.errorMessage = '';

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.selectedFile = null;
      this.errorMessage = 'Solo se permiten archivos CSV.';
      input.value = '';
      return;
    }

    if (file.size === 0) {
      this.selectedFile = null;
      this.errorMessage = 'El archivo seleccionado está vacío.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile || this.loading) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.importsService.uploadFile(this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Archivo procesado correctamente.';
        this.selectedFile = null;

        // Después de una nueva importación volvemos a la primera página.
        this.currentPage = 1;
        this.loadImports();
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'No fue posible procesar el archivo.';

        this.changeDetector.detectChanges();
      }
    });
  }

  loadImports(): void {
    this.loadingHistory = true;

    this.importsService
      .getImports(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.imports = response.data;

          this.currentPage = response.pagination.page;
          this.totalImports = response.pagination.total;
          this.totalPages = response.pagination.totalPages;

          this.loadingHistory = false;

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Error cargando importaciones:', error);

          this.loadingHistory = false;
          this.errorMessage =
            'No fue posible cargar el historial de importaciones.';

          this.changeDetector.detectChanges();
        }
      });
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.loadingHistory
    ) {
      return;
    }

    this.currentPage = page;
    this.loadImports();
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

  viewImport(id: number): void {
    this.loadingDetail = true;
    this.errorMessage = '';
    this.selectedImport = null;
    this.importErrors = [];

    this.importsService.getImportById(id).subscribe({
      next: (importData) => {
        this.selectedImport = importData;

        this.importsService.getImportErrors(id).subscribe({
          next: (errors) => {
            this.importErrors = errors;
            this.loadingDetail = false;

            this.changeDetector.detectChanges();
          },

          error: (error) => {
            console.error('Error cargando errores:', error);

            this.importErrors = [];
            this.loadingDetail = false;
            this.errorMessage =
              'No fue posible cargar los errores de la importación.';

            this.changeDetector.detectChanges();
          }
        });
      },

      error: (error) => {
        console.error('Error cargando detalle:', error);

        this.loadingDetail = false;
        this.errorMessage =
          'No fue posible cargar el detalle de la importación.';

        this.changeDetector.detectChanges();
      }
    });
  }

  closeDetail(): void {
    this.selectedImport = null;
    this.importErrors = [];
  }
}