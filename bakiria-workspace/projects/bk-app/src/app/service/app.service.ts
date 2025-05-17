import { Injectable, signal } from '@angular/core';

export interface User {
  name?: string;
  isLoggedIn: boolean;
  role: string;
  token: string;
  image: string | null;
}

const roles = ['admin', 'jefe', 'compras', 'cocinero', 'cliente', 'vendedor'];

const resetUsuer:User = {
  name: 'Desconocido',
  isLoggedIn: false,
  role: 'cliente',
  token: '',
  image: null
};

export interface appData {
  version?: string;
  name: string;
  headerHeight: string;
  logo: string;
}

const resetApp:appData = {
  name: 'bakiria',
  headerHeight: '60px',
  logo: 'images/logo1.png',
};


@Injectable({
  providedIn: 'root'
})

export class AppService {
  public app = signal<appData>(resetApp);
  public user = signal<User>(resetUsuer);
  logout() {
    this.user.set(resetUsuer);
  }
}

