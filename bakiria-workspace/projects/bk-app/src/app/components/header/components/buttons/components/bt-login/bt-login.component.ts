import { Component } from '@angular/core';

@Component({
  selector: 'app-bt-login',
  imports: [],
  templateUrl: './bt-login.component.html',
  styleUrl: './bt-login.component.scss'
})
export class BtLoginComponent {
 isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    console.log('Dropdown toggled:', this.isOpen);
  }
}
