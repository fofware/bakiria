import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  // Ruta para el login
  {
    path: 'login',
    loadComponent: () => import('./login/login.component')
  },
  // Ruta para el registro
  {
    path: 'register',
    loadComponent: () => import( './register/register.component')
  },
  // Ruta para el perfil, protegida por AuthGuard
  { path: 'profile',
    loadComponent: () => import( './profile/profile.component'),
    canActivate: [AuthGuard] // Protege esta ruta con AuthGuard
  },
  // Ruta por defecto: redirige a /profile
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  // Ruta comodín para cualquier otra URL no encontrada: redirige a /profile
  { path: '**', redirectTo: '/profile' }

];
