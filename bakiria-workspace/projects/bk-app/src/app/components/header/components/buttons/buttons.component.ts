import { DropdownsComponent } from './../../../../../../../bk-lib/src/lib/components/dropdowns/dropdowns.component';
import { User } from './../../../../service/app.service';
import { Component, input, output } from '@angular/core';
import { LoggedComponent } from "./components/logged/logged.component";
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [LoggedComponent],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export class ButtonsComponent {
  user = input<User>();
  algo = output<boolean>();
  onLogout() {
    console.log('Logout clicked');
  }
}
