import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-bt-user',
  imports: [],
  templateUrl: './bt-user.component.html',
  styleUrl: './bt-user.component.scss'
})
export class BtUserComponent {
  private authService = inject(AuthService); // Inyectar el servicio de autenticación
  user:any = this.authService.loggedUser; // Obtener el perfil del usuario desde el servicio de autenticación
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    console.log('Dropdown toggled:', this.isOpen);
  }

}
