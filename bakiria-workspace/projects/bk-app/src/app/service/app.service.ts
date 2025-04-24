import { Injectable, signal } from '@angular/core';

export interface User {
  name?: string;
  authenticated: boolean;
  role: string;
  token: string;
  image: string;
}
const resetUsuer:User = {
  name: '',
  authenticated: false,
  role: 'visitor',
  token: '',
  image: 'assets/user.png'
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

}

