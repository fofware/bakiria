import { AuthService } from './../../../../../auth/auth.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-bt-login',
  imports: [],
  templateUrl: './bt-login.component.html',
  styleUrl: './bt-login.component.scss'
})
export class BtLoginComponent {
  private authService = inject(AuthService); // Inyectar el servicio de autenticación
  user:any = this.authService.loggedUser; // Obtener el perfil del usuario desde el servicio de autenticación
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    console.log('Dropdown toggled:', this.isOpen);
  }
}
