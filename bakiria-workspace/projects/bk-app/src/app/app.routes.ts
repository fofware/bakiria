import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProfileComponent } from './components/auth/profile.component';
import { AuthGuard } from './components/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((mod) => mod.DashboardComponent),
  },
  // Ruta para el login
  { path: 'login', component: LoginComponent },
  // Ruta para el registro
  { path: 'register', component: RegisterComponent },
  // Ruta para el perfil, protegida por AuthGuard
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // Ruta por defecto: redirige a /profile
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  // Ruta comodín para cualquier otra URL no encontrada: redirige a /profile
  { path: '**', redirectTo: '/profile' }

];
