import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BkLibComponent } from 'bk-lib';
import { HeaderComponent } from "./components/header/header.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BkLibComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bk-app';
}
