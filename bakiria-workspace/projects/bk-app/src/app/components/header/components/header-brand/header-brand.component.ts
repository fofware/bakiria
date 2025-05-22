import { Component, input } from '@angular/core';

@Component({
  selector: 'app-header-brand',
  imports: [],
  templateUrl: './header-brand.component.html',
  styleUrl: './header-brand.component.scss'
})
export class HeaderBrandComponent {
  brand = input<string>();

}
