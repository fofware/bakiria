import { inject } from '@angular/core';
// register.component.ts
// Componente para la página de registro de usuarios locales.

import { Component, OnInit } from '@angular/core';
// Importar módulos necesarios directamente en el componente standalone
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from './auth.service'; // Importar el servicio de autenticación

@Component({
  selector: 'app-register',
  standalone: true, // Marcar como componente standalone
  imports: [
    CommonModule, // Para directivas comunes como *ngIf
    ReactiveFormsModule, // Para formularios reactivos
    RouterModule // Para routerLink
  ],
  template: `
    <h2>Registro de Usuario</h2>
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="displayName">Nombre:</label>
        <input id="displayName" type="text" formControlName="displayName">
        <div *ngIf="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched">
          Nombre es requerido.
        </div>
      </div>
      <div>
        <label for="email">Email:</label>
        <input id="email" type="email" formControlName="email">
        <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
          Email es requerido y debe ser válido.
        </div>
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input id="password" type="password" formControlName="password">
        <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
          Contraseña es requerida.
        </div>
      </div>
      <button type="submit" [disabled]="registerForm.invalid">Registrarse</button>
    </form>

    <div *ngIf="errorMessage" style="color: red;">
      {{ errorMessage }}
    </div>
  `,
  styles: [
    // Puedes añadir estilos CSS aquí si es necesario
  ]
})
export default class RegisterComponent implements OnInit {
  registerForm: FormGroup; // Formulario reactivo para el registro
  errorMessage: string | null = null; // Variable para mostrar mensajes de error

  private fb = inject(FormBuilder); // Inyectar FormBuilder para crear el formulario
  private authService = inject(AuthService); // Inyectar el servicio de autenticación
  private router = inject(Router); // Inyectar Router para la navegación

  constructor(
  ) {
    // Inicializar el formulario con los campos y validadores
    this.registerForm = this.fb.group({
      displayName: ['', Validators.required], // Campo nombre a mostrar: requerido
      email: ['', [Validators.required, Validators.email]], // Campo email: requerido y formato email
      password: ['', Validators.required], // Campo password: requerido
      // celular: [''] // Añadir si incluyes el campo celular en el template
    });
  }

  ngOnInit(): void {
    // Lógica de inicialización si es necesaria
  }

  // Maneja el envío del formulario de registro local
  onSubmit(): void {
    if (this.registerForm.valid) { // Verificar si el formulario es válido
      // Llamar al método register del servicio de autenticación con los datos del formulario.
      this.authService.register(this.registerForm.value).subscribe(
        () => {
          // Si el registro es exitoso (y el backend devuelve token), redirigir al perfil.
          this.router.navigate(['/profile']);
        },
        (error:any) => {
          // Si hay un error en el registro, mostrar un mensaje de error.
          this.errorMessage = 'Error al registrar usuario. Intenta con otro email.';
          console.error('Register error:', error); // Loguear el error en la consola
        }
      );
    }
  }
}
