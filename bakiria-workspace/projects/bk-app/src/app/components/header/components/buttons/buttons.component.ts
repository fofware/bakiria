import { DropdownsComponent } from './../../../../../../../bk-lib/src/lib/components/dropdowns/dropdowns.component';
import { User } from './../../../../service/app.service';
import { Component, input, output } from '@angular/core';
import { BtLoginComponent } from "./components/bt-login/bt-login.component";
import { BtLoggedComponent } from './components/bt-logged/bt-logged.component';
import { BtUserComponent } from "../../../auth/bt-user/bt-user.component";
import LoginComponent from "../../../auth/login/login.component";

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [BtLoggedComponent, BtLoginComponent, BtUserComponent, LoginComponent],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export class ButtonsComponent {
  user = input<User>();
  onLogout() {
    console.log('Logout clicked');
  }
}
