import { DropdownsComponent } from './../../../../../../../bk-lib/src/lib/components/dropdowns/dropdowns.component';
import { User } from './../../../../service/app.service';
import { Component, input, output } from '@angular/core';
import { LoggedComponent } from "./components/logged/logged.component";
import { BtLoginComponent } from "./components/bt-login/bt-login.component";
import LoginComponent from "../../../auth/login.component";

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [LoggedComponent, BtLoginComponent, LoginComponent],
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
