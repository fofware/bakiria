// login.component.ts
// Componente para la página de inicio de sesión.
// Permite login local con email/password y redirecciona para login social.
// Lee el token de los query parameters después del login social.

import { Component, inject, OnInit } from '@angular/core';
// Importar módulos necesarios directamente en el componente standalone
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { AuthService } from '../auth.service'; // Importar el servicio de autenticación

@Component({
  selector: 'app-login',
  standalone: true, // Marcar como componente standalone
  templateUrl: './login.component.html', // Ruta al template HTML del componente
  styleUrls: ['./login.component.scss'], // Ruta a los estilos CSS del componente
  imports: [
    CommonModule, // Para directivas comunes como *ngIf
    ReactiveFormsModule, // Para formularios reactivos
    RouterModule // Para routerLink y ActivatedRoute
  ],
})
export default class LoginComponent implements OnInit {
  loginForm: FormGroup; // Formulario reactivo para el login
  errorMessage: string | null = null; // Variable para mostrar mensajes de error

  private fb = inject(FormBuilder); // Inyectar FormBuilder para crear el formulario
  private authService = inject(AuthService); // Inyectar el servicio de autenticación
  private router = inject(Router); // Inyectar Router para la navegación
  private activatedRoute = inject(ActivatedRoute); // Inyectar ActivatedRoute para leer query parameters

  constructor() {
    // Inicializar el formulario con los campos y validadores
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Campo email: requerido y formato email
      password: ['', Validators.required] // Campo password: requerido
    });
  }

  ngOnInit(): void {
    // Al inicializar el componente, verificamos si hay un token en los query parameters de la URL.
    // Esto ocurre después de un login social exitoso, donde el backend redirige con el token.
    this.activatedRoute.queryParams.subscribe(params => {
      const token = params['token']; // Intentar obtener el parámetro 'token'
      if (token) {
        this.authService.storeToken(token); // Si encontramos un token, lo almacenamos.
        this.router.navigate(['/auth/profile']); // Y redirigimos al usuario a la página de perfil.
      }
    });
  }

  // Maneja el envío del formulario de login local
  onSubmit(): void {
    if (this.loginForm.valid) { // Verificar si el formulario es válido
      // Llamar al método login del servicio de autenticación con los datos del formulario.
      this.authService.login(this.loginForm.value).subscribe(
        () => {
          // Si el login es exitoso, redirigir al perfil.
          this.router.navigate(['/auth/profile']);
        },
        (error) => {
          // Si hay un error en el login, mostrar un mensaje de error.
          this.errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
          console.error('Login error:', error); // Loguear el error en la consola
        }
      );
    }
  }

  // Inicia el flujo de login con Google llamando al servicio de autenticación
  loginWithGoogle(): void {
    //this.authService.loginWithGoogle(); // Redirigir al endpoint de Google en el backend
    this.authService.loginWithSocial('google');
  }

  // Inicia el flujo de login con Facebook llamando al servicio de autenticación
  loginWithFacebook(): void {
    //this.authService.loginWithFacebook();
    this.authService.loginWithSocial('facebook');
  }
}
