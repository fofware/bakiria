import { DropdownsComponent } from './../../../../../bk-lib/src/lib/components/dropdowns/dropdowns.component';
import { Component, inject } from '@angular/core';
import { HeaderLogoComponent } from './components/header-logo/header-logo.component';
import { AppService } from '../../service/app.service';
import { MenuComponent } from './components/menu/menu.component';
import { ButtonsComponent } from './components/buttons/buttons.component';

@Component({
  selector: 'app-header',
  imports: [HeaderLogoComponent, MenuComponent, ButtonsComponent, DropdownsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  app = inject(AppService).app;
  user = inject(AppService).user;
}
