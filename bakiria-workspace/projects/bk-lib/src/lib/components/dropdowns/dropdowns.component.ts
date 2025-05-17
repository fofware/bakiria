import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'lib-dropdowns',
  imports: [],
  templateUrl: './dropdowns.component.html',
  styleUrl: './dropdowns.component.css'
})
export class DropdownsComponent {
  isOpen = input.required<boolean>();
  /*
  isOpenLog = computed((): void => {
    console.log('Dropdown toggled:', this.isOpen());
  }
  );
  */
}
