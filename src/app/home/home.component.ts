import {Component, OnInit} from '@angular/core';
import {AuthService} from '../shared/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService) {
  }


  ngOnInit(): void {
    console.log('HomeComponent INIT');
  }

  showInfoClicked(): void {
    console.log('Show info clicked');
  }

  logoutClicked(): void {
    console.log('Logout clicked');
    this.authService.doLogout();
  }


}

