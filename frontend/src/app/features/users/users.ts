import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import {
  UsersService,
  UserItem,
  CreateUserRequest
} from '../../core/services/users';

@Component({
  selector: 'app-users',
  imports: [FormsModule, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  private readonly usersService = inject(UsersService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  users: UserItem[] = [];

  loading = true;
  saving = false;

  showForm = false;

  successMessage = '';
  errorMessage = '';

  form: CreateUserRequest = {
    name: '',
    email: '',
    password: '',
    role: 'CONSULTA'
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Error cargando usuarios:', error);

        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          'No fue posible cargar los usuarios.';

        this.changeDetector.detectChanges();
      }
    });
  }

  openForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.form = {
      name: '',
      email: '',
      password: '',
      role: 'CONSULTA'
    };

    this.showForm = true;
  }

  closeForm(): void {
    if (this.saving) {
      return;
    }

    this.showForm = false;
  }

  createUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (
      !this.form.name.trim() ||
      !this.form.email.trim() ||
      !this.form.password.trim()
    ) {
      this.errorMessage = 'Completa todos los campos obligatorios.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage =
        'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.saving = true;

    const user: CreateUserRequest = {
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      password: this.form.password,
      role: this.form.role
    };

    this.usersService.createUser(user).subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.successMessage = 'Usuario creado correctamente.';

        this.loadUsers();

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Error creando usuario:', error);

        this.saving = false;

        this.errorMessage =
          error?.error?.message ||
          'No fue posible crear el usuario.';

        this.changeDetector.detectChanges();
      }
    });
  }
}