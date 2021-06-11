import {Injectable, Injector} from '@angular/core';
import {DefaultService} from "eisenstecken-openapi-angular-library";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static accessTokenKey = "access_token";

  constructor(private injector: Injector, private router: Router) { }

  getToken() : string{
    return localStorage.getItem(AuthService.accessTokenKey);
  }

  setToken(token: string) :void {
    localStorage.setItem(AuthService.accessTokenKey, token);
    this.injector.get<DefaultService>(DefaultService).configuration.credentials["OAuth2PasswordBearer"] = token;
  }

  removeToken() : void {
    localStorage.removeItem(AuthService.accessTokenKey);
    this.injector.get<DefaultService>(DefaultService).configuration.credentials["OAuth2PasswordBearer"] = null;
  }

  isLoggedIn(): boolean {
    const authToken = this.getToken();
    return (authToken !== null);
  }

  doLogout() : void {
    this.removeToken();
    console.log("Login Success");
    //TODO: move to loginpage!?
  }

  login(username: string, password: string) :void{
    const tokenObservable = this.injector.get<DefaultService>(DefaultService).loginForAccessTokenTokenPost(username, password);
    tokenObservable.subscribe({
      next: event => {
        console.log('Login Success!');
        this.setToken(event.access_token);
        this.router.navigate(['login']);
      },
      error: msg => {
        console.log('Error logging in: ', msg);
        //TODO: do something if no success -> error msg? Too extract login, maybe do a callback?
      }
    });
  }
}

