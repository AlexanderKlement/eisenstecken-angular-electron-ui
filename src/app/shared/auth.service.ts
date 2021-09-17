import {Injectable, Injector} from '@angular/core';
import {DefaultService, Right} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static accessTokenKey = 'access_token';

  constructor(private injector: Injector, private router: Router) {
  }

  getToken(): string {
    return localStorage.getItem(AuthService.accessTokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(AuthService.accessTokenKey, token);
    this.injector.get<DefaultService>(DefaultService).configuration.credentials.OAuth2PasswordBearer = token;
  }

  removeToken(): void {
    localStorage.removeItem(AuthService.accessTokenKey);
    this.injector.get<DefaultService>(DefaultService).configuration.credentials.OAuth2PasswordBearer = null;
  }

  isLoggedIn(): boolean {
    const authToken = this.getToken();
    return (authToken !== null);
  }

  doLogout(): void {
    this.removeToken();
    console.log('Login Success');
  }

  async getScopeString(): Promise<string> {
    const rights = await this.getRights();
    const rightArray: string[] = rights.map((elem) => elem.key);
    const scope = rightArray.join(' ');
    console.log('Using scope:' + scope);
    return scope;
  }

  async getRights(): Promise<Right[]> {
    const rights = this.injector.get<DefaultService>(DefaultService).getRightsRightsGet();
    return await rights.toPromise();
  }

  async login(username: string, password: string): Promise<boolean> {
    const tokenObservable = this.injector.get<DefaultService>(DefaultService)
      .loginForAccessTokenTokenPost(username, password, 'password', await this.getScopeString());
    return new Promise<boolean>((resolve, reject) => {
      tokenObservable.subscribe((token) => {
        if (token.access_token.length > 0) {
          this.setToken(token.access_token);
        }
        resolve(true);
      }, (error) => {
        console.error('Unable to login');
        console.error(error);
        resolve(false);
      }, () => {
        reject('TIMEOUT: No Internet');
      });
    });
  }
}

