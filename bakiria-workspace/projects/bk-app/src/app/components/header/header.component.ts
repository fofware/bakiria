import { Component } from '@angular/core';
import { HeaderLogoComponent } from '../header-logo/header-logo.component';

@Component({
  selector: 'app-header',
  imports: [HeaderLogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
