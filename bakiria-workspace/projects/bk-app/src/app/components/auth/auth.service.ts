// auth.service.ts
// Servicio de autenticación para manejar el login, registro, logout y obtención del perfil.
// Utiliza HttpClient para comunicarse con el backend y localStorage para almacenar el token JWT.
// Incluye verificación de plataforma para SSR.

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common'; // Importar para verificar la plataforma
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root' // Este servicio está disponible en toda la aplicación (singleton)
})
export class AuthService {
  // URL base de tu backend integrado (debe coincidir con el puerto de tu servidor SSR)
  private baseUrl = environment.AUTH_URL || 'http://localhost:3000';


  constructor(
    private http: HttpClient,
    private router: Router,
    // Inyectar PLATFORM_ID para verificar si estamos en el navegador o en el servidor
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // Almacena el token JWT en localStorage si estamos en el navegador
  storeToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt_token', token);
    }
  }

  // Obtiene el token JWT de localStorage si estamos en el navegador
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null; // Devolver null si no estamos en el navegador (servidor)
  }

  // Elimina el token JWT de localStorage si estamos en el navegador
  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
    }
  }

  // Verifica si el usuario está autenticado (basado en la existencia del token en el navegador)
  isAuthenticated(): boolean {
     if (isPlatformBrowser(this.platformId)) {
        return !!this.getToken();
     }
     // Durante el renderizado en el servidor, asumimos que el usuario no está autenticado
     // para evitar intentar cargar datos de perfil sin un token válido.
     // La autenticación real ocurre en el navegador después de la hidratación.
     return false;
  }

  // Envía credenciales al backend para el login local
  login(credentials: any): Observable<any> {
    console.log('Login credentials:', credentials); // Log para depuración
    console.log('Base URL:', `${this.baseUrl}/login`); // Log para depuración
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        console.log('Login response:', response); // Log para depuración
        // Si el login es exitoso y recibimos un token, lo almacenamos.
        if (response.token) {
          this.storeToken(response.token);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error); // Log para depuración
        return of(error);
      }
      // Aquí podrías añadir catchError para manejar errores específicos del login
      ));
  }

  // Envía datos de usuario al backend para el registro local
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData).pipe(
      tap((response: any) => {
        // Si el registro es exitoso y recibimos un token (si el backend lo devuelve), lo almacenamos.
        if (response.token) {
          this.storeToken(response.token);
        }
      })
      // Aquí podrías añadir catchError para manejar errores específicos del registro
    );
  }

  // Redirige al endpoint de Google en el backend para iniciar el flujo OAuth
  loginWithGoogle(): void {
    // Asegúrate de que esta URL coincida con tu ruta de inicio de Google en el backend SSR
    window.location.href = 'http://localhost:4444/auth/google';
  }

  // Redirige al endpoint de Facebook en el backend para iniciar el flujo OAuth
  loginWithFacebook(): void {
    // Asegúrate de que esta URL coincida con tu ruta de inicio de Facebook en el backend SSR
    window.location.href = 'http://localhost:4444/auth/facebook';
  }

  // Obtiene el perfil del usuario del backend (ruta protegida por JWT)
  getProfile(): Observable<any> {
    const token = this.getToken(); // Obtener el token almacenado
    if (!token) {
      // Si no hay token, devolvemos un observable que emite null y completa.
      // Esto es importante para que los componentes que llaman a getProfile no se queden esperando.
      return of(null);
    }
    // Crear encabezados HTTP, incluyendo el token JWT en el formato Bearer
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // Realizar la solicitud GET al endpoint /api/profile con los encabezados.
    return this.http.get(`${this.baseUrl}/profile`, { headers });
  }

  // Cierra la sesión del usuario eliminando el token y redirigiendo a la página de login
  logout(): void {
    this.removeToken(); // Eliminar el token almacenado
    this.router.navigate(['/auth/login']); // Navegar a la ruta de login
  }
}
