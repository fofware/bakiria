import { Component, input } from '@angular/core';
import { User } from '../../../../../../service/app.service';

@Component({
  selector: 'app-logged',
  imports: [],
  templateUrl: './logged.component.html',
  styleUrl: './logged.component.scss'
})
export class LoggedComponent {
  user = input<User>();

}
