import { Component, input } from '@angular/core';
import { User } from '../../../../../../service/app.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  user = input<User>();

}
