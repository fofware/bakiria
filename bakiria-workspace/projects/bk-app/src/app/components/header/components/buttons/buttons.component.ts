import { DropdownsComponent } from './../../../../../../../bk-lib/src/lib/components/dropdowns/dropdowns.component';
import { User } from './../../../../service/app.service';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [DropdownsComponent],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export class ButtonsComponent {
  data = input<User>();
}
