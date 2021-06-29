import { Component, OnInit } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {DefaultService, Lock, User} from "eisenstecken-openapi-angular-library";
import {DataSourceClass} from "../../types";

@Component({
  selector: 'app-base-edit',
  template: ``,
  styleUrls: ['./base-edit.component.scss']
})
export class BaseEditComponent <T extends DataSourceClass> implements OnInit {

  //This has to be defined by Derived class:
  navigationTarget: string;
  lockFunction: (api: DefaultService, id: number) => Observable<Lock>;
  dataFunction: (api: DefaultService, id: number) => Observable<T>;

  //this not:
  me: Observable<User>;
  data$: BehaviorSubject<T>;


  constructor(protected api: DefaultService, protected router: Router, protected route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.me = this.api.readUsersMeUsersMeGet();
    this.route.params.subscribe((params) => {
      let id;
      try {
        id = parseInt(params.id);
      } catch {
        console.error("Cannot parse given id");
        this.goBack();
        return;
      }
      this.lockFunction(this.api, id).subscribe(lock => {
        if (!lock.locked)
          this.goBack();
        this.me.subscribe((user) => {
          if (user.id != lock.user.id)
            this.goBack();
          else
            this.dataFunction(this.api, id).subscribe(this.data$);
        });
      });
    });
  }

  goBack() : void {
    this.router.navigate([this.navigationTarget]);
  }

}
