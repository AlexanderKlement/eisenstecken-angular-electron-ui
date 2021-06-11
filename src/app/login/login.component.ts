import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AuthService} from "../shared/auth.service";
import {DefaultService} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
  });

  constructor(private authService: AuthService, private api: DefaultService) {
    console.log(this.api.readUnitsUnitGet());
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    console.info("Login Button clicked");
    console.log(this.loginForm.value);
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password);
  }
}

