import { Component } from '@angular/core';

@Component({
  selector: 'lib-dropdowns',
  imports: [],
  templateUrl: './dropdowns.component.html',
  styleUrl: './dropdowns.component.css'
})
export class DropdownsComponent {
  isOpen = false;
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  closeDropdown() {
    this.isOpen = false;
  }
  openDropdown() {
    this.isOpen = true;
  }
}
