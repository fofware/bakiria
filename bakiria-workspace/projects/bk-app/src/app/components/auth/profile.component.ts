// profile.component.ts
// Componente para mostrar la información del perfil del usuario.
// Es una ruta protegida que requiere que el usuario esté autenticado.

import { Component, inject, OnInit } from '@angular/core';
// Importar módulos necesarios directamente en el componente standalone
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from './auth.service'; // Importar el servicio de autenticación

@Component({
  selector: 'app-profile',
  standalone: true, // Marcar como componente standalone
  imports: [
    CommonModule, // Para directivas comunes como *ngIf
    RouterModule // Para routerLink si se necesitara en el template
  ],
  template: `
    <h2>Perfil de Usuario</h2>
    <div *ngIf="userProfile">
      <p><strong>Nombre:</strong> {{ userProfile.displayName }}</p>
      <p><strong>Email:</strong> {{ userProfile.email }}</p>
      <p><strong>Proveedor:</strong> {{ userProfile.provider }}</p>
      <p *ngIf="userProfile.celular"><strong>Celular:</strong> {{ userProfile.celular }}</p>
      </div>
    <div *ngIf="!userProfile">
      <p>Cargando perfil o no autenticado.</p>
    </div>
    <button (click)="logout()">Cerrar Sesión</button>
  `,
  styles: [
    // Puedes añadir estilos CSS aquí si es necesario
  ]
})
export class ProfileComponent implements OnInit {
  userProfile: any = null; // Variable para almacenar los datos del perfil del usuario
  private authService = inject(AuthService); // Inyectar el servicio de autenticación
  private router = inject(Router); // Inyectar Router para la navegación

  constructor(
  ) { }

  ngOnInit(): void {
    // Al inicializar el componente, verificamos si el usuario está autenticado.
    if (this.authService.isAuthenticated()) {
      // Si está autenticado, intentamos obtener los datos del perfil del backend.
      this.authService.getProfile().subscribe(
        (profile) => {
          // Si la solicitud es exitosa, almacenamos los datos del perfil.
          this.userProfile = profile;
        },
        (error:any) => {
          // Si hay un error al obtener el perfil (ej. token inválido/expirado),
          // logueamos el error y cerramos la sesión.
          console.error('Error al obtener perfil:', error);
          this.authService.logout(); // Cerrar sesión para eliminar el token inválido
        }
      );
    } else {
      // Si el usuario no está autenticado (no hay token válido), lo redirigimos a la página de login.
      this.router.navigate(['/login']);
    }
  }

  // Llama al método logout del servicio de autenticación para cerrar la sesión.
  logout(): void {
    this.authService.logout();
  }
}
