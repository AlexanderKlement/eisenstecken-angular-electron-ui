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
    const keyName = "bearer-key";
    if (this.localStorageService.getItem(keyName) != null){
      if(!checkLogin()){
        showLoginDialog();
      }
    } else {
      showLoginDialog();
    }
  }


}

function showLoginDialog(){

}

function checkLogin() : boolean{
  return true;
}
