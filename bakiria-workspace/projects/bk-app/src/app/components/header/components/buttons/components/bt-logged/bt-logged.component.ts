import { Component } from '@angular/core';
import { User } from '../../../../../../service/app.service';
import { input } from '@angular/core'; // Importar input desde Angular core
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-bt-logged',
  imports: [JsonPipe],
  templateUrl: './bt-logged.component.html',
  styleUrl: './bt-logged.component.scss'
})
export class BtLoggedComponent {
  user = input<User>();

}
