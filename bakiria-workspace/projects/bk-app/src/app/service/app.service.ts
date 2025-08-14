import { Injectable, signal } from '@angular/core';

export interface User {
  displayName: string;
  isLoggedIn: boolean;
  roles: string[];
  picture: string | null;
}

const roles = ['admin', 'jefe', 'compras', 'cocinero', 'cliente', 'vendedor'];

const resetUsuer:User = {
  displayName: 'Visitante',
  isLoggedIn: false,
  roles: ['guest'],
  picture: null
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

