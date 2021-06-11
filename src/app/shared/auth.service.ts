import { Injectable } from '@angular/core';
import {Configuration, DefaultService} from "eisenstecken-openapi-angular-library";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static accessTokenKey = "access_token";

  constructor(private api: DefaultService, private apiConfiguration: Configuration) { }

  getToken() : string{
    return localStorage.getItem(AuthService.accessTokenKey);
  }

  setToken(token: string) :void {
    localStorage.setItem(AuthService.accessTokenKey, token);
    this.apiConfiguration.credentials["OAuth2PasswordBearer"] = token;
  }

  removeToken() : void {
    localStorage.removeItem(AuthService.accessTokenKey);
    this.apiConfiguration.credentials["OAuth2PasswordBearer"] = null;
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
    const tokenObservable = this.api.loginForAccessTokenTokenPost(username, password);
    tokenObservable.subscribe({
      next(token) {
        console.log('Login Success!');
        this.setToken(token.access_token);
        //TODO: move to /home??
      },
      error(msg) {
        console.log('Error Getting Location: ', msg);
        //TODO: do something if no success
      }
    });
  }
}

