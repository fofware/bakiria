// auth.guard.ts
// Guardia de ruta para proteger rutas que requieren autenticación.

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service'; // Importar el servicio de autenticación

@Injectable({
  providedIn: 'root' // Esta guardia está disponible en toda la aplicación
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // Implementación del método canActivate
  canActivate(
    route: ActivatedRouteSnapshot, // Información sobre la ruta actual
    state: RouterStateSnapshot // Información sobre el estado actual del router
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Verificar si el usuario está autenticado usando el servicio de autenticación.
    if (this.authService.isAuthenticated()) {
      return true; // Si está autenticado, permite el acceso a la ruta.
    } else {
      // Si no está autenticado, redirige a la página de login.
      // createUrlTree permite crear una URL Tree para la redirección.
      return this.router.createUrlTree(['/login']);
    }
  }
}
