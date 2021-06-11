import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,  private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    const keyName = "bearer-key"; //TODO: after testing move this to a separate file, that gets loaded on every route change/load (for web) -> wrong! use a directive or a routing option
    if (this.localStorageService.getItem(keyName) != null){
      if(!this.checkLogin()){
        this.routeLogin();
      }
    } else {
      this.routeLogin();
    }
  }

  routeLogin() : void{
    this.router.navigate(['login']);
  }

  checkLogin() : boolean{
    return true;
  }



}

