import { Component, OnInit } from '@angular/core';
import {DefaultService} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  constructor(private api: DefaultService) {
    const tokenObservable = this.api.loginForAccessTokenTokenPost("alexander.klement@gmail.com", "Hallo123");
    const locationsSubscription = tokenObservable.subscribe({
      next(position) {
        console.log('Current Position: ', position.access_token);
      },
      error(msg) {
        console.log('Error Getting Location: ', msg);
      }
    });
  }

  ngOnInit(): void {
  }

}

